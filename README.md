# TFG
Codi del TFG, hi ha el server i el front end, es necessitaria una base de dades amb la seguent estructura:

DROP SCHEMA IF EXISTS edCrumble;
create schema edCrumble;
use edCrumble;

CREATE TABLE EdCrumbleJson
(
	id INTEGER NOT NULL PRIMARY KEY,
	jsonFile JSON,
	userName varchar(50)
);

Els JSON ha de tenir els seguents paràmetres:

http://doi.org/10.5281/zenodo.4905491
