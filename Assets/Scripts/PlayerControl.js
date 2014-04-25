#pragma strict
/**
	Handles all the player data and manages the player's units
*/
var gameControl : GameObject;
var units : GameObject[];
var Solider : GameObject;
var Walker : GameObject;
var Mutant : GameObject;
var Ship : GameObject;
var FirstX : int;
var FirstY : int;
var TotalUnitCount : int;
var UnitsMoved : int;
var PlayerNum : int;
var Bank : int;
var Buying : boolean;
var unitToDisplay : GameObject;

function Start () {
	gameControl = GameObject.FindGameObjectWithTag("GameController");
	units = new GameObject[81];
	units[0] = gameControl.transform.FindChild("Grid").GetComponent(GridControl).PopulateSquare(Solider, FirstX, FirstY);
	TotalUnitCount = 1;
	UnitsMoved = 0;
	Bank = 50;
	unitToDisplay = Solider;
}

//check to see if the player has moved all their units
function CheckRoundEnd(){
	return UnitsMoved == TotalUnitCount;
}

//resets all units for the next round (allows them to move again
function ResetUnits(){
	for(var i = 0; i < TotalUnitCount; i++){
		units[i].GetComponent(UnitControl).hasMoved = false;
	}
	UnitsMoved = 0;
}

//add a new unit to the units list
function Add(unit : GameObject){
	unit.GetComponent(UnitControl).hasMoved = true;
	units[TotalUnitCount] = unit;
	TotalUnitCount++;
	UnitsMoved++;
}

//Remove unit from the list
function Remove(unit : GameObject){
	if(unit.GetComponent(UnitControl).hasMoved){
		UnitsMoved--;
	}
	var removalIndex : int;
	for(var i = 0; i < TotalUnitCount; i++){
		if(units[i].Equals(unit)){
			removalIndex = i;
			break;
		}
	}
	
	//move all units after the deleted one up a space
	for(var j = removalIndex; j < TotalUnitCount; j++){
		units[j] = units[j+1];
	}
	
	TotalUnitCount --;
}

//cycles through the unit options
function DisplayNextUnit(){
	if (unitToDisplay.Equals(Solider)){
		unitToDisplay = Mutant;
	}
	else if (unitToDisplay.Equals(Mutant)){
		unitToDisplay = Walker;
	}
	else if (unitToDisplay.Equals(Walker)){
		unitToDisplay = Ship;
	}
	else if (unitToDisplay.Equals(Ship)){
		unitToDisplay = Solider;
	}
}

//displays the player info and action options
function OnGUI(){
	var ButtonHeight = Screen.height / 16;
	var ButtonWidth = Screen.width / 11;
	
	var offsetX : float;
	if(PlayerNum == 2){
		offsetX = ButtonWidth * 7.45;
	}
	else{
		offsetX = 0;
	}
	
	GUI.Label(new Rect(ButtonWidth * 1.5 + offsetX, ButtonHeight * 1.25, ButtonWidth, ButtonHeight),"Player " + PlayerNum);
	GUI.Label(new Rect(ButtonWidth * 1.45 + offsetX, ButtonHeight * 3.75, ButtonWidth, ButtonHeight),"Player Info");
	GUI.Label(new Rect(ButtonWidth * 1.45 + offsetX, ButtonHeight * 7.6, ButtonWidth, ButtonHeight),"Unit Types");
	GUI.Label(new Rect(ButtonWidth * 1.6 + offsetX, ButtonHeight * 11.50, ButtonWidth, ButtonHeight),"Actions");
	
	//player info
	var playerInfo : String;
	playerInfo = "Funds: " + Bank +"\n";
	playerInfo += "Total Units: " + TotalUnitCount +"\n";
	playerInfo += "Units Used This Round: " + UnitsMoved +"\n";
	GUI.Label(new Rect(ButtonWidth * 0.75 + offsetX, ButtonHeight * 4.75, ButtonWidth * 2.25, ButtonHeight * 2),playerInfo);
	
	//unit info
	var unitInfo : String;
	var control = unitToDisplay.GetComponent(UnitControl);
	unitInfo = unitToDisplay.name.Remove(unitToDisplay.name.IndexOf(" ")) + "\n";
	unitInfo += "Speed: " + control.spd + "\t Range: "+ control.rng + "\n";
	unitInfo += "Attack: " + control.atk + "\t Health: "+ control.hlth + "\t Cost: "+ control.cost + "\n";
	GUI.Label(new Rect(ButtonWidth * 0.75 + offsetX, ButtonHeight * 8.6, ButtonWidth * 2.25, ButtonHeight * 2),unitInfo);
	
	//Move to the next unit
	if(GUI.Button(new Rect(ButtonWidth * 2.25 + offsetX, ButtonHeight * 8.6, ButtonWidth * 0.5, ButtonHeight),"->")){
		DisplayNextUnit();
	}
	
	//Buying and passing
	if(gameControl.GetComponent(GameControl).IsBuyPossible()){
		if(PlayerNum == gameControl.GetComponent(GameControl).currentPlayer){
			if(!Buying){
				//The buy buttons sets up the unit options
				//only available when possible to buy
				if(Bank > 0 && gameControl.GetComponent(GameControl).PlayerHasRegion(PlayerNum)){
					if(GUI.Button(new Rect(ButtonWidth * 0.75 + offsetX, ButtonHeight * 12.25, ButtonWidth, ButtonHeight),"BUY")){
						Buying = true;
					}
				}
				//the pass button is only available when no units can be moved
				if(UnitsMoved == TotalUnitCount){
					if(GUI.Button(new Rect(ButtonWidth * 2 + offsetX, ButtonHeight * 12.25, ButtonWidth, ButtonHeight),"PASS")){
						if(PlayerNum==1){
							gameControl.GetComponent(GameControl).currentPlayer = 2;
						}
						else{
							gameControl.GetComponent(GameControl).currentPlayer = 1;
						}
					}
				}
			}
			else{
				//setup the four unit buttons
				//only display options the player can afford
				
				var SoliderCost = Solider.GetComponent(UnitControl).cost;
				var MutantCost = Mutant.GetComponent(UnitControl).cost;
				var WalkerCost = Walker.GetComponent(UnitControl).cost;
				var ShipCost = Ship.GetComponent(UnitControl).cost;
			
				if(Bank >= SoliderCost){
					if(GUI.Button(new Rect(ButtonWidth * 0.75 + offsetX, ButtonHeight * 12.25, ButtonWidth, ButtonHeight),"SOLIDER")){
						gameControl.GetComponent(GameControl).Buy(Solider);
						Bank -= SoliderCost;
						Buying = false;
					}
				}
				if(Bank >= MutantCost){
					if(GUI.Button(new Rect(ButtonWidth * 1.9 + offsetX, ButtonHeight * 12.25, ButtonWidth, ButtonHeight),"MUTANT")){
						gameControl.GetComponent(GameControl).Buy(Mutant);
						Bank -= MutantCost;
						Buying = false;
					}
				}
				if(Bank >= WalkerCost){
					if(GUI.Button(new Rect(ButtonWidth * 0.75 + offsetX, ButtonHeight * 13.25, ButtonWidth, ButtonHeight),"WALKER")){
						gameControl.GetComponent(GameControl).Buy(Walker);
						Bank -= WalkerCost;
						Buying = false;
					}
				}
				if(Bank >= ShipCost){
					if(GUI.Button(new Rect(ButtonWidth * 1.9 + offsetX, ButtonHeight * 13.25, ButtonWidth, ButtonHeight),"SHIP")){
						gameControl.GetComponent(GameControl).Buy(Ship);
						Bank -= ShipCost;
						Buying = false;
					}
				}
			}
		}
	}
	else{
		Buying = false;
	}
}