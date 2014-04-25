#pragma strict
/**
	GUI handler designed to show the user both of a round end,
	and the game end
*/
var RoundStyle : GUIStyle;
var PlayerStyle : GUIStyle;
var RoundNum : int;
var PlayerNum : int;
var Showing : boolean;
var c : Color;
var Finished : boolean;

function Start () {
	RoundNum = 1;
	PlayerNum = 1;
	Showing = true;
	Finished = false;
	c = GetComponent(SpriteRenderer).color;
}

function OnGUI() {
	var centerX = Screen.width / 2;
	var centerY = Screen.height / 2;
	if(Showing){
		//Round has ended prompt players
		GUI.Label(new Rect(centerX-250, centerY-100,500,100),"Round " + RoundNum, RoundStyle);
		GUI.Label(new Rect(centerX-250, centerY,500,100),"Player " + PlayerNum + " Starts", PlayerStyle);
	}
	if(Finished){
		//Game has ended, prompt users and provide a replay button
		GUI.Label(new Rect(centerX-250, centerY-100,500,100),"Game Over", RoundStyle);
		GUI.Label(new Rect(centerX-250, centerY,500,100),"Player " + PlayerNum + " Wins!", PlayerStyle);
		if(GUI.Button(new Rect(centerX - 40,centerY +80, 80,20),"Replay")){
			Application.LoadLevel(1);
		}
	}
}

//increases round number, and takes (as input) which player is first in this round
function SetVariables( p : int)
{
	RoundNum++;
	PlayerNum = p;
}

//hides prompt
function Hide(){
	c.a = 0;
	GetComponent(SpriteRenderer).color = c;
	Showing = false;
}

//shows prompt
function Show(){
	c.a = 1;
	GetComponent(SpriteRenderer).color = c;
	Showing = true;
}

//game has ended show prompt with end-game setup
function EndGame( p : int){
	PlayerNum = p;
	Finished = true;
	Showing = false;
	c.a = 1;
	GetComponent(SpriteRenderer).color = c;
}