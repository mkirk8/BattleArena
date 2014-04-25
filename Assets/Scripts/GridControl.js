#pragma strict
/**
	This manages each individual grid panel, and keeps track of unit locations
*/

var grid : GameObject[,];

function Awake () {
	grid = new GameObject[9,9];
}

/**
	Creates an instance of prefab into cell x, y
*/
function PopulateSquare(prefab : GameObject, x : int, y : int){
	var panelPos : Vector3;
	panelPos = transform.FindChild(x + " " + y).transform.position;
	panelPos.z = -2.8;
		
	var panelScale : Vector3;
	panelScale = transform.FindChild(x + " " + y).transform.lossyScale;
	if(prefab.GetComponent(UnitControl).IsShip){
		panelPos.x += (panelScale.x * 4.5);
		panelPos.y -= (panelScale.z * 4.5);
	}
	else{
		panelPos.x -= (panelScale.x * 3.5);
		panelPos.y += (panelScale.z * 3.5);
	}
	
	var panelRot : Quaternion;
	panelRot = new Quaternion(0,0,0,0);
	
	var object : GameObject;
	object = Instantiate(prefab,panelPos,panelRot);
	grid[x,y] = object;
	if(object.GetComponent(UnitControl).IsShip){
		if(x < 8){
			grid[x+1,y] = object;
		}
		if(y < 8){
			grid[x,y+1] = object;
		}
		if(x < 8 && y < 8){
			grid[x+1,y+1] = object;
		}
	}
	return object;
}

/**
	Shows potential options for movement (recursively calls ShowGridMove)
*/
function DisplayMovement(unit : GameObject){
	HideAll();
	if(!unit.GetComponent(UnitControl).hasMoved){
		var loc : Vector2;
		loc = FindLocation(unit);
		var speed = unit.GetComponent(UnitControl).spd;
		var x = loc.x;
		var y = loc.y;
		transform.FindChild(x + " " + y).GetComponent(GridPanelControl).Reveal();
		ShowGridMove(x,y + 1,speed,unit);
		ShowGridMove(x,y - 1,speed,unit);
		ShowGridMove(x - 1,y,speed,unit);
		ShowGridMove(x + 1,y,speed,unit);
	}
}

/**
	Recursively checks for valid places to move (other units block paths)
*/
function ShowGridMove(x : int, y : int, speed : int, unit : GameObject){
	if(x > -1 && x < 9 && y > -1 && y < 9 && speed > 0){
		if(grid[x,y] == null || grid[x,y].Equals(unit)){
			transform.FindChild(x + " " + y).GetComponent(GridPanelControl).Reveal();
			ShowGridMove(x,y + 1,speed - 1,unit);
			ShowGridMove(x,y - 1,speed - 1,unit);
			ShowGridMove(x - 1,y,speed - 1,unit);
			ShowGridMove(x + 1,y,speed - 1,unit);
		}
	}
}

/**
	Shows potential options for attack (recursively calls ShowGridRange)
*/
function DisplayRange(unit : GameObject){
	HideAll();
	if(!unit.GetComponent(UnitControl).hasMoved){
		var loc : Vector2;
		loc = FindLocation(unit);
		var speed = unit.GetComponent(UnitControl).rng;
		var x = loc.x;
		var y = loc.y;
		transform.FindChild(x + " " + y).GetComponent(GridPanelControl).Reveal();
		if(unit.GetComponent(UnitControl).IsShip){
			//A ships unique 2 by 2 size grants it a unique range of attack	
			ShowGridRange(x,y,speed + 1);
			ShowGridRange(x,y + 1,speed + 1);
			ShowGridRange(x + 1,y,speed + 1);
			ShowGridRange(x + 1,y + 1,speed + 1);
		}
		else{
			ShowGridRange(x,y + 1,speed);
			ShowGridRange(x,y - 1,speed);
			ShowGridRange(x - 1,y,speed);
			ShowGridRange(x + 1,y,speed);
		}
	}
}

/**
	Recursively checks for valid places to move (other units do not block paths)
*/
function ShowGridRange(x : int, y : int, speed : int){
	if(x > -1 && x < 9 && y > -1 && y < 9 && speed > 0){
		transform.FindChild(x + " " + y).GetComponent(GridPanelControl).Reveal();
		var ret : boolean;
		ShowGridRange(x,y + 1,speed - 1);
		ShowGridRange(x,y - 1,speed - 1);
		ShowGridRange(x - 1,y,speed - 1);
		ShowGridRange(x + 1,y,speed - 1);
	}
}

/**
	Hide all gridpanels
*/
function HideAll(){
	for(var x = 0; x < 9; x++){
		for(var y = 0; y < 9; y++){
			transform.FindChild(x + " " + y).GetComponent(GridPanelControl).Hide();
		}
	}
}

/**
	grab the grid of gameobjects
*/
function GetGrid(){
	return grid;
}

/**
	moves an object from one location in the grid to another
*/
function Move(older : Vector2, newer : Vector2){
	var tempObject : GameObject;
	tempObject = grid[older.x,older.y];
	grid[older.x,older.y] = null;
	grid[newer.x,newer.y] = tempObject;
	
	//ships are 2 by 2 and thus take more movement
	if(tempObject.GetComponent(UnitControl).IsShip){
		if(older.x <8){
			grid[older.x+1,older.y] = null;
		}
		if(newer.x <8){
			grid[newer.x+1,newer.y] = tempObject;
		}
		if(older.y <8){
			grid[older.x,older.y+1] = null;
		}
		if(newer.y <8){
			grid[newer.x,newer.y+1] = tempObject;
		}
		if(older.x <8 && older.y <8){
			grid[older.x+1,older.y+1] = null;
		}
		if(newer.x <8 && newer.y <8){
			grid[newer.x+1,newer.y+1] = tempObject;
		}
	}
}

/**
	find the grid coordinates for an object
*/
function FindLocation(unit : GameObject){
	for(var x = 0; x < 9; x++){
		for(var y = 0; y < 9; y++){
			if(unit.Equals(grid[x,y])){
				return new Vector2(x,y);
			}
		}
	}
}