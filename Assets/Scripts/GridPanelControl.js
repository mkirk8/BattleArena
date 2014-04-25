#pragma strict
/**
	Simple object designed to hide and reveal a single grid panel
*/
var rend : MeshRenderer;
var matC : Color;
var x : int;
var y : int;

function Start () {
	rend = GetComponent(MeshRenderer);
	matC = renderer.material.color;
	Hide();
}

function Reveal(){
	matC.a = 0.3f;
	renderer.material.color = matC;
}

function Hide(){
	matC.a = 0f;
	renderer.material.color = matC;
}

function IsRevealed(){
	return matC.a > 0f;
}

function GetCoord(){
	return new Vector2(x,y);
}