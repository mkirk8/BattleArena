#pragma strict
/**
	Changes between the region materials when prompted
*/
var rend : MeshRenderer;
var Player1Mat: Material;
var Player2Mat: Material;
var NoPlayerMat: Material;

function Start () {
	rend = GetComponent(MeshRenderer);
	rend.material = NoPlayerMat;
}

function SetRegionControl(playerNum : int){
	if (playerNum == 1){
		rend.material = Player1Mat;
	}
	else if (playerNum == 2){
		rend.material = Player2Mat;
	}
	else {
		rend.material = NoPlayerMat;
	}
}