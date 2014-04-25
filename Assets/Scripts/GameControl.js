#pragma strict
/**
	The Heart of game logic, this controls game states, 
	and the transfer of information between other gameobjects
*/

var selectedUnit : GameObject;
var previousXY : Vector2;
var nextXY : Vector2;
var currentPlayer : int;
var playerAtNextRound : int;
var attacking : boolean;
var buying : boolean;
var scoring : boolean;
var walking : boolean;
var regionToScore : int;
var comboToCheck : int;
var scoringWaitTime : float;
var RegionControlArray : int[];
var TenPoints : GameObject;
var TwentyPoints : GameObject;
var GamePromptTime : float;

function Start () {
	currentPlayer = 1;
	playerAtNextRound = 2;
	attacking = false;
	buying = false;
	scoring = false;
	RegionControlArray = new int[9];
	regionToScore = 0;
    comboToCheck = 0;
    scoringWaitTime = 0f;
    GamePromptTime = 2.5f;
}

function Update () {
	//First check for a winner
	var gameEnd = CheckGameEnd();
	if(gameEnd != 0){
		currentPlayer = 0;
		GameObject.Find("RoundPrompt").GetComponent(RoundPrompt).EndGame(gameEnd);
	}
	//Next check to see if the round board is currently being displayed
	else if(GamePromptTime > 0){
		GamePromptTime -= Time.deltaTime;
		if(GamePromptTime <= 0){
			GameObject.Find("RoundPrompt").GetComponent(RoundPrompt).Hide();
		}
	}
	else{
		
		//Move the player tag to indicate whose turn it is
		var position : Vector3;
		position = GameObject.Find("PlayerTag").transform.position;
		if(currentPlayer == 1){
			position.x = -22.17;
		}
		else{
			position.x = 22.4;
		}
		GameObject.Find("PlayerTag").transform.position = position;
		
		//Set the region planes to match their controller's colour
		SetRegions(transform.FindChild("Grid").GetComponent(GridControl).GetGrid());
		
		//Check to see if the round has ended
		if(!attacking && ! buying){
			CheckRoundEnd();
		}
	
		if(!scoring && Input.GetMouseButtonDown(0))
		{
			var v3 = Input.mousePosition;
			v3.z = 10.0;
			v3 = Camera.main.ScreenToWorldPoint(v3);
	
			var mousePoint : Vector2;
			mousePoint = new Vector2(v3.x, v3.y);
			
			//Mouse input received. If a unit is selected, 
			//see if a valid grid panel has been clicked		
			if(selectedUnit != null){
				var hits3D : RaycastHit[];
				var ray : Ray = Camera.main.ScreenPointToRay (Input.mousePosition);
				hits3D = Physics.RaycastAll(ray,10);
				for(var i = 0; i < hits3D.Length; i++){
					if (hits3D[i].transform.gameObject.tag.Equals("GridPanel")){
						if(hits3D[i].transform.gameObject.GetComponent(GridPanelControl).IsRevealed()){
							var coord : Vector2;
							var g : GameObject[,];
							g = transform.FindChild("Grid").GetComponent(GridControl).GetGrid();
							coord = hits3D[i].transform.gameObject.GetComponent(GridPanelControl).GetCoord();
						
							if(buying){
								//Grid Panel was clicked while buying, place new unit
								if(g[coord.x,coord.y] == null){
									var newUnit : GameObject;
									newUnit = transform.FindChild("Grid").GetComponent(GridControl).PopulateSquare(selectedUnit,coord.x,coord.y);
									GameObject.Find("Player "+currentPlayer).GetComponent(PlayerControl).Add(newUnit);
									buying = false;transform.FindChild("Grid").GetComponent(GridControl).HideAll();
									if(currentPlayer == 1){
										currentPlayer = 2;
									}
									else{
										currentPlayer = 1;
									}
								}
							}
							else if(attacking){
								//Grid panel clicked while attacking. Launch attack
								if(g[coord.x,coord.y] != null){
									selectedUnit.GetComponent(UnitControl).Fire(g[coord.x,coord.y]);
								}
								else{
									AttackCompleted();
								}
							}
							else{
								//Grid panel clicked has triggers unit movement
								walking = true;
								previousXY = transform.FindChild("Grid").GetComponent(GridControl).FindLocation(selectedUnit);
								selectedUnit.GetComponent(UnitControl).MoveTo(hits3D[i].transform.gameObject);
								nextXY = hits3D[i].transform.gameObject.GetComponent(GridPanelControl).GetCoord();
							}
						}
					}
				}
			}
		
			//Check to see if a unit has been clicked on
			var hits : RaycastHit2D[];
			hits = Physics2D.LinecastAll(mousePoint, mousePoint);
			if(!attacking){
				for(i = 0; i < hits.Length; i++){
					if(hits[i].transform.gameObject.tag.Equals("Unit"))
					{
						//Unit was clicked, set them to the selected unit, and display movement
						//if the unit is a valid option
						var conUnit : UnitControl;
				
						selectedUnit = hits[i].transform.gameObject;
						conUnit = selectedUnit.GetComponent(UnitControl);
						if(IsUnitValid()){
							transform.FindChild("Grid").GetComponent(GridControl).DisplayMovement(selectedUnit);
						}
						else{
							transform.FindChild("Grid").GetComponent(GridControl).HideAll();
						}
					}
				}
			}
		}
		else if (scoring){
    		Score();
		}
	}
}

/**
	Triggered when an attack has finished to continue the gamelogic
*/
function AttackCompleted(){
	attacking = false;
	transform.FindChild("Grid").GetComponent(GridControl).HideAll();
	if(currentPlayer == 1){
		currentPlayer = 2;
	}
	else{
		currentPlayer = 1;
	}
}

/**
	Checks if either player has run out of units
*/
function CheckGameEnd(){
	if(GameObject.Find("Player 1").GetComponent(PlayerControl).TotalUnitCount == 0){
		return 2;
	}
	if(GameObject.Find("Player 2").GetComponent(PlayerControl).TotalUnitCount == 0){
		return 1;
	}
	return 0;
}

/**
	Checks if all units have moved, is so it prepares for scoring
*/
function CheckRoundEnd(){
	if(GameObject.Find("Player 1").GetComponent(PlayerControl).CheckRoundEnd() 
	&& GameObject.Find("Player 2").GetComponent(PlayerControl).CheckRoundEnd()){
		GameObject.Find("Player 1").GetComponent(PlayerControl).ResetUnits();
		GameObject.Find("Player 2").GetComponent(PlayerControl).ResetUnits();
		currentPlayer = playerAtNextRound;
		
		if(playerAtNextRound == 1){
			playerAtNextRound = 2;
		}
		else{
			playerAtNextRound = 1;
		}
		scoring = true;
	}
}

/**
	Checks to see if a unit belongs to the current player
*/
function IsUnitValid(){
	if(selectedUnit.name.LastIndexOf("1") > -1 && currentPlayer == 1){
		return true;
	}
	if(selectedUnit.name.LastIndexOf("2") > -1 && currentPlayer == 2){
		return true;
	}
	return false;
}

/**
	Recording the most recent move into player data
*/
function RecordMove(){
	if(selectedUnit.name.LastIndexOf("1") > -1){
		GameObject.Find("Player 1").GetComponent(PlayerControl).UnitsMoved++;
	}
	else{
		GameObject.Find("Player 2").GetComponent(PlayerControl).UnitsMoved++;
	}
	transform.FindChild("Grid").GetComponent(GridControl).DisplayRange(selectedUnit);
	attacking = true;
	walking = false;
}

/**
	Recording the most recent move into grid
*/
function MovementCompleted(){
	transform.FindChild("Grid").GetComponent(GridControl).Move(previousXY,nextXY);
	transform.FindChild("Grid").GetComponent(GridControl).HideAll();
	RecordMove();
}

/**
	Checks each Region to see which, if any, player controls the region
	then sets region color, and stores value for later use
*/
function SetRegions(grid : GameObject[,]){
	var regInt : int;
	var i : int;
	var j : int;
	var u : int;
	
	regInt = -1;
	for (i = 0; i < 3; i ++){
		for (j = 0; j < 3; j ++){
			u = UnitValue(grid[i,j]);
			if(regInt != 0 && regInt != u){
				if(regInt == -1){
					regInt = u;
				}
				else if(u != -1){
					regInt = 0;
				}
			}
		}
	}
	transform.FindChild("Regions").FindChild("Region 0").GetComponent(RegionControl).SetRegionControl(regInt);
	RegionControlArray[0] = regInt;
	
	regInt = -1;
	for (i = 0; i < 3; i ++){
		for (j = 3; j < 6; j ++){
			u = UnitValue(grid[i,j]);
			if(regInt != 0 && regInt != u){
				if(regInt == -1){
					regInt = u;
				}
				else if(u != -1){
					regInt = 0;
				}
			}
		}
	}
	transform.FindChild("Regions").FindChild("Region 1").GetComponent(RegionControl).SetRegionControl(regInt);
	RegionControlArray[1] = regInt;
	
	regInt = -1;
	for (i = 0; i < 3; i ++){
		for (j = 6; j < 9; j ++){
			u = UnitValue(grid[i,j]);
			if(regInt != 0 && regInt != u){
				if(regInt == -1){
					regInt = u;
				}
				else if(u != -1){
					regInt = 0;
				}
			}
		}
	}
	transform.FindChild("Regions").FindChild("Region 2").GetComponent(RegionControl).SetRegionControl(regInt);
	RegionControlArray[2] = regInt;
	
	regInt = -1;
	for (i = 3; i < 6; i ++){
		for (j = 0; j < 3; j ++){
			u = UnitValue(grid[i,j]);
			if(regInt != 0 && regInt != u){
				if(regInt == -1){
					regInt = u;
				}
				else if(u != -1){
					regInt = 0;
				}
			}
		}
	}
	transform.FindChild("Regions").FindChild("Region 3").GetComponent(RegionControl).SetRegionControl(regInt);
	RegionControlArray[3] = regInt;
	
	regInt = -1;
	for (i = 3; i < 6; i ++){
		for (j = 3; j < 6; j ++){
			u = UnitValue(grid[i,j]);
			if(regInt != 0 && regInt != u){
				if(regInt == -1){
					regInt = u;
				}
				else if(u != -1){
					regInt = 0;
				}
			}
		}
	}
	transform.FindChild("Regions").FindChild("Region 4").GetComponent(RegionControl).SetRegionControl(regInt);
	RegionControlArray[4] = regInt;
	
	regInt = -1;
	for (i = 3; i < 6; i ++){
		for (j = 6; j < 9; j ++){
			u = UnitValue(grid[i,j]);
			if(regInt != 0 && regInt != u){
				if(regInt == -1){
					regInt = u;
				}
				else if(u != -1){
					regInt = 0;
				}
			}
		}
	}
	transform.FindChild("Regions").FindChild("Region 5").GetComponent(RegionControl).SetRegionControl(regInt);
	RegionControlArray[5] = regInt;
	
	regInt = -1;
	for (i = 6; i < 9; i ++){
		for (j = 0; j < 3; j ++){
			u = UnitValue(grid[i,j]);
			if(regInt != 0 && regInt != u){
				if(regInt == -1){
					regInt = u;
				}
				else if(u != -1){
					regInt = 0;
				}
			}
		}
	}
	transform.FindChild("Regions").FindChild("Region 6").GetComponent(RegionControl).SetRegionControl(regInt);
	RegionControlArray[6] = regInt;
	
	regInt = -1;
	for (i = 6; i < 9; i ++){
		for (j = 3; j < 6; j ++){
			u = UnitValue(grid[i,j]);
			if(regInt != 0 && regInt != u){
				if(regInt == -1){
					regInt = u;
				}
				else if(u != -1){
					regInt = 0;
				}
			}
		}
	}
	transform.FindChild("Regions").FindChild("Region 7").GetComponent(RegionControl).SetRegionControl(regInt);
	RegionControlArray[7] = regInt;
	
	regInt = -1;
	for (i = 6; i < 9; i ++){
		for (j = 6; j < 9; j ++){
			u = UnitValue(grid[i,j]);
			if(regInt != 0 && regInt != u){
				if(regInt == -1){
					regInt = u;
				}
				else if(u != -1){
					regInt = 0;
				}
			}
		}
	}
	transform.FindChild("Regions").FindChild("Region 8").GetComponent(RegionControl).SetRegionControl(regInt);
	RegionControlArray[8] = regInt;
}

/**
	Checks to see which player a unit belongs to
*/
function UnitValue(unit : GameObject){
	if (unit == null){
		return -1;
	}
	
	if(unit.name.LastIndexOf("1") > -1){
		return 1;
	}
	else{
		return 2;
	}
}

/**
	Checks to see if the current state allows for the purchase of new untis
*/
function IsBuyPossible(){
	return !walking && !attacking && !scoring && !buying && GamePromptTime <= 0;
}

/**
	Checks if a player has any regions in their control 
	(cannot purchase a unit without control of a region)
*/
function PlayerHasRegion(p : int){
	for(var i = 0; i < 9; i++){
		if(RegionControlArray[i] == p){
			return true;
		}
	}
	return false;
}

/**
	Highlights the mossible places to place a new unit
*/
function Buy(toBuy : GameObject){
	selectedUnit = toBuy;
	var x : int;
	var y : int;
	transform.FindChild("Grid").GetComponent(GridControl).HideAll();
	buying = true;
	
	if(RegionControlArray[0] == currentPlayer){
		for(x = 0; x < 3; x++){
			for(y = 0; y < 3; y++){
				GameObject.Find(x + " " + y).GetComponent(GridPanelControl).Reveal();
			}
		}
	}
	
	if(RegionControlArray[1] == currentPlayer){
		for(x = 0; x < 3; x++){
			for(y = 3; y < 6; y++){
				GameObject.Find(x + " " + y).GetComponent(GridPanelControl).Reveal();
			}
		}
	}
	
	if(RegionControlArray[2] == currentPlayer){
		for(x = 0; x < 3; x++){
			for(y = 6; y < 9; y++){
				GameObject.Find(x + " " + y).GetComponent(GridPanelControl).Reveal();
			}
		}
	}
	
	if(RegionControlArray[3] == currentPlayer){
		for(x = 3; x < 6; x++){
			for(y = 0; y < 3; y++){
				GameObject.Find(x + " " + y).GetComponent(GridPanelControl).Reveal();
			}
		}
	}
	
	if(RegionControlArray[4] == currentPlayer){
		for(x = 3; x < 6; x++){
			for(y = 3; y < 6; y++){
				GameObject.Find(x + " " + y).GetComponent(GridPanelControl).Reveal();
			}
		}
	}
	
	if(RegionControlArray[5] == currentPlayer){
		for(x = 3; x < 6; x++){
			for(y = 6; y < 9; y++){
				GameObject.Find(x + " " + y).GetComponent(GridPanelControl).Reveal();
			}
		}
	}
	
	if(RegionControlArray[6] == currentPlayer){
		for(x = 6; x < 9; x++){
			for(y = 0; y < 3; y++){
				GameObject.Find(x + " " + y).GetComponent(GridPanelControl).Reveal();
			}
		}
	}
	
	if(RegionControlArray[7] == currentPlayer){
		for(x = 6; x < 9; x++){
			for(y = 3; y < 6; y++){
				GameObject.Find(x + " " + y).GetComponent(GridPanelControl).Reveal();
			}
		}
	}
	
	if(RegionControlArray[8] == currentPlayer){
		for(x = 6; x < 9; x++){
			for(y = 6; y < 9; y++){
				GameObject.Find(x + " " + y).GetComponent(GridPanelControl).Reveal();
			}
		}
	}
}

/**
	Awards the players with funds.
	First $10 for each region they control
	Then $60 for each line they control.
*/
function Score(){
	if(scoringWaitTime <= 0){
    	//Single Region Scoring
    	if(comboToCheck == 0){
			if(RegionControlArray[regionToScore] > 0){
				Instantiate(TenPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(regionToScore,RegionControlArray[regionToScore]);
				GameObject.Find("Player "+RegionControlArray[regionToScore]).GetComponent(PlayerControl).Bank += 10;
				scoringWaitTime = 0.5;
			}
			regionToScore++;
			if(regionToScore == 9){
				comboToCheck = 1;
				regionToScore = 0;
			}
		}
		//Horizontal Combo Scoring
		else if(comboToCheck == 1){
			if(RegionControlArray[0] == RegionControlArray[1] && RegionControlArray[0] == RegionControlArray[2] 
			&& RegionControlArray[0] > 0){
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(0,RegionControlArray[0]);
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(1,RegionControlArray[1]);
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(2,RegionControlArray[2]);
				GameObject.Find("Player "+RegionControlArray[0]).GetComponent(PlayerControl).Bank += 60;
				scoringWaitTime = 0.5;
			}
			comboToCheck = 2;
		}
		else if(comboToCheck == 2){
			if(RegionControlArray[3] == RegionControlArray[4] && RegionControlArray[3] == RegionControlArray[5] 
			&& RegionControlArray[3] > 0){
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(3,RegionControlArray[3]);
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(4,RegionControlArray[4]);
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(5,RegionControlArray[5]);
				GameObject.Find("Player "+RegionControlArray[3]).GetComponent(PlayerControl).Bank += 60;
				scoringWaitTime = 0.5;
			}
			comboToCheck = 3;
		}
		else if(comboToCheck == 3){
			if(RegionControlArray[6] == RegionControlArray[7] && RegionControlArray[6] == RegionControlArray[8] 
			&& RegionControlArray[6] > 0){
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(6,RegionControlArray[6]);
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(7,RegionControlArray[7]);
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(8,RegionControlArray[8]);
				GameObject.Find("Player "+RegionControlArray[6]).GetComponent(PlayerControl).Bank += 60;
				scoringWaitTime = 0.5;
			}
			comboToCheck = 4;
		}
		//Vertical Combo Scoring
		else if(comboToCheck == 4){
			if(RegionControlArray[0] == RegionControlArray[3] && RegionControlArray[0] == RegionControlArray[6] 
			&& RegionControlArray[0] > 0){
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(0,RegionControlArray[0]);
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(3,RegionControlArray[3]);
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(6,RegionControlArray[6]);
				GameObject.Find("Player "+RegionControlArray[0]).GetComponent(PlayerControl).Bank += 60;
				scoringWaitTime = 0.5;
			}
			comboToCheck = 5;
		}
		else if(comboToCheck == 5){
			if(RegionControlArray[1] == RegionControlArray[4] && RegionControlArray[1] == RegionControlArray[7] 
			&& RegionControlArray[1] > 0){
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(1,RegionControlArray[1]);
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(4,RegionControlArray[4]);
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(7,RegionControlArray[7]);
				GameObject.Find("Player "+RegionControlArray[1]).GetComponent(PlayerControl).Bank += 60;
				scoringWaitTime = 0.5;
			}
			comboToCheck = 6;
		}
		else if(comboToCheck == 6){
			if(RegionControlArray[2] == RegionControlArray[5] && RegionControlArray[2] == RegionControlArray[8] 
			&& RegionControlArray[2] > 0){
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(2,RegionControlArray[8]);
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(5,RegionControlArray[5]);
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(8,RegionControlArray[8]);
				GameObject.Find("Player "+RegionControlArray[2]).GetComponent(PlayerControl).Bank += 60;
				scoringWaitTime = 0.5;
			}
			comboToCheck = 7;
		}
		//Diagonal Combo Scoring
		else if(comboToCheck == 7){
			if(RegionControlArray[0] == RegionControlArray[4] && RegionControlArray[0] == RegionControlArray[8] 
			&& RegionControlArray[0] > 0){
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(0,RegionControlArray[0]);
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(4,RegionControlArray[4]);
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(8,RegionControlArray[8]);
				GameObject.Find("Player "+RegionControlArray[0]).GetComponent(PlayerControl).Bank += 60;
				scoringWaitTime = 0.5;
			}
			comboToCheck = 8;
		}
		else if(comboToCheck == 8){
			if(RegionControlArray[2] == RegionControlArray[4] && RegionControlArray[2] == RegionControlArray[8] 
			&& RegionControlArray[2] > 0){
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(2,RegionControlArray[2]);
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(4,RegionControlArray[4]);
				Instantiate(TwentyPoints,new Vector3(0,0,0),new Quaternion(0,0,0,0)).GetComponent(PointControl).SetMovement(8,RegionControlArray[8]);
				GameObject.Find("Player "+RegionControlArray[2]).GetComponent(PlayerControl).Bank += 60;
				scoringWaitTime = 0.5;
			}
			comboToCheck = 0;
			scoring = false;
			GamePromptTime = 2.5f;
			GameObject.Find("RoundPrompt").GetComponent(RoundPrompt).SetVariables(currentPlayer);
			GameObject.Find("RoundPrompt").GetComponent(RoundPrompt).Show();
		}
	}
	else{
		scoringWaitTime -= Time.deltaTime;
	}
}

/**
	Displays states of selected unit, and creates the main-menu button
*/
function OnGUI(){
	if(GUI.Button(new Rect(Screen.width / 22,0,Screen.width / 11,Screen.height / 16),"Main Menu")){
		Application.LoadLevel(0);
	}
	
	if(selectedUnit != null){
		var unitInfo : String;
		var control = selectedUnit.GetComponent(UnitControl);
		if(selectedUnit.name.IndexOf("(") >-1){
			unitInfo = selectedUnit.name.Remove(selectedUnit.name.IndexOf("(")) + ":\t";
		}
		else{
			unitInfo = selectedUnit.name.Remove(selectedUnit.name.IndexOf("(")) + ":\t";
		}
		unitInfo += "Speed: " + control.spd + "\t Range: "+ control.rng + "\n";
		unitInfo += "Attack: " + control.atk + "\t Health: "+ control.hlth + "\t Cost: "+ control.cost + "\n";
		
		GUI.Label(new Rect((Screen.width / 4)*1.3,(Screen.height / 6) * 4.9, (Screen.width / 2), (Screen.height / 6)),unitInfo); 
	}
}
