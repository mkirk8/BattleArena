#pragma strict
/**
	Simple GUI handler, used to display the instructions window only when needed
	using a boolean switch an a SpriteRenderer's opacity
*/
var style : GUIStyle;
var style2 : GUIStyle;
var showing : boolean;
var c : Color;

function Start(){
	showing = false;
	c = gameObject.GetComponent(SpriteRenderer).color;
}

function Update(){
	if(showing){
		c.a = 1;
	}
	else{
		c.a = 0;
	}
	gameObject.GetComponent(SpriteRenderer).color = c;
}

function OnGUI(){
	if(showing){
		GUI.Label(new Rect((Screen.width / 3),(Screen.height / 12)*1.75,(Screen.width / 3),(Screen.height / 12)),"Instructions",style);
		var text : String;
		text = "Battle Arena is a simple game where two players build armies in a batle to the death.";
		text += "The arena is split into 9 regions, and a player controls a region when only they have";
		text += "units occupying the region. The match itself is split into rounds. A round ends when ";
		text += "all units have moved. During each round players take turns making moves. Including:\n";
		text += "            -Select a unit it, and move it to a new square. Then attack another unit ";
		text += "that is within range.\n";
		text += "            -Purchase a new unit with their current funds, and place it in a region ";
		text += "they occupy. The new unit cannot move that round.\n";
		text += "At the end of each round funds are awarded to the players. $10 given for each region";
		text += "a player controls, and $60 additional for each line of regions a player controls";
		text += "(horizontal, vertical, or diagonal). The starting player for each round alternates. ";
		text += "Player 1 starts first during odd rounds, and Player 2 starts first during even rounds.";
		
		GUI.Label(new Rect((Screen.width / 2) - ((Screen.width / 7)* 2.5),(Screen.height / 12)*4,(Screen.width /7)* 5,(Screen.height / 12)*7),text,style2);
		if(GUI.Button(new Rect((Screen.width / 2) - 50,(Screen.height / 12)*9.6,100,(Screen.height / 12)),"Main Menu")){
			showing = false;
			GameObject.Find("Background").GetComponent(MenuUI).showing = true;
		}
	}
}