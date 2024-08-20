import { Router } from "express";
import { getFarmalinkToken, sendRecetaToFarmalink } from "./../controllers/c_farmalink.js";

const rFarmalink = Router();

// [GET]
rFarmalink.get("/token", getFarmalinkToken);

// [POST]
rFarmalink.post("/receta/:idreceta", sendRecetaToFarmalink);

/*
// [PUT]
rFarmalink.put("/receta/:idreceta", sendRecetaToFarmalink);

// [DELETE]
rFarmalink.delete("/receta/:idreceta", sendRecetaToFarmalink);
*/

export default rFarmalink;