#pragma strict
/**
	Simple GUI handler, used to display the main menu window only when needed
	using a boolean switch (should not appear while instructions are up)
*/

var style : GUIStyle;
var showing : boolean;

function Start(){
	showing = true;
}

function OnGUI () {
	if(showing){
		GUI.Label(new Rect((Screen.width / 2)-100, (Screen.height / 2)-100,200,50),"Battle Arena",style);
		if(GUI.Button(new Rect((Screen.width / 2)-50, (Screen.height / 2),100,50),"Instructions")){
			GameObject.Find("Instructions").GetComponent(Instructions).showing = true;
			showing = false;
		}
		if(GUI.Button(new Rect((Screen.width / 2)-50, (Screen.height / 2)+ 50,100,50),"Play Game")){
			Application.LoadLevel(1);
		}
		if(GUI.Button(new Rect((Screen.width / 2)-50, (Screen.height / 2)+ 100,100,50),"Quit")){
			Application.Quit();
		}
	}
}