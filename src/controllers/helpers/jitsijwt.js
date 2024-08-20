import jsonwebtoken from "jsonwebtoken";

//Function generates a JaaS JWT.
export const generate = (privateKey, { id, name, email, avatar, appId, kid }) => {
	const now = new Date()
	const jwt = jsonwebtoken.sign({
		aud: "jitsi",
		iss: "chat",
		iat: Math.floor(Date.now() / 1000),
		sub: appId,
		exp: Math.round(now.setHours(now.getHours() + 3) / 1000),
		nbf: (Math.round((new Date).getTime() / 1000) - 10),
		context: {
			features: {
				livestreaming: true,
				"outbound-call": true,
				"sip-outbound-call": false,
				transcription: true,
				recording: true
			},
			/*
			user: {
				id,
				name,
				avatar,
				email: email,
				moderator: "true"
			},
			*/
			user: {
				"hidden-from-recorder": false,
				moderator: true,
				name: name,
				id: id,
				avatar: avatar,
				email: email,
			}
		},
		room: "*"
	}, privateKey, { algorithm: "RS256", header: { kid } });

	return jwt;
}