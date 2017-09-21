#!/usr/bin/env node

/********************************************************************
 *
 *  TypeScript Trans Gender Piler
 *  -----------------------------------
 *  I´m not sure how serious you should take this project
 *  it´ something I threw together now while watching Criminal Minds!
 *
 *  This is the cleaned up version (you should have seen the
 *  massive parser attempt I made in this very  same file, I took a
 *  deep breath and realized that once again I was "over doing" it,
 *  so here´s a output prettifier made with old goog substringi´n
 *  minimal fault tolerance included.
 *
 *  I choose to release this under the terms of LGPL-2.1 I think
 *  Stallman have some good ideas for these kinds of hacks.
 *
 *  Enjoy!
 *
 *  Patrik Forsberg, Coldmind Ltd <patrik.forsberg@coldmind.com>
 *  2017-09-22 00:02 , yay the day of the new iPhones!!!
 *
 ******************************************************************/

var program		= require('commander');
var chalk       = require("chalk");
var clear       = require("clear");
var CLI         = require("clui");
var figlet      = require("figlet");
var inquirer    = require("inquirer");
var Preferences = require("preferences");
var fs          = require("fs");
var exec		= require('child_process').exec;
var EOL			= require('os').EOL;

//clear();

/*program
    .version('0.0.1')
    .usage('[options] <keywords>')
    .option('-o, --owner [name]', 'Filter by the repositories owner')
    .option('-l, --language [language]', 'Filter by the repositories language')
    .option('-f, --full', 'Full output without any styling')
    .parse(process.argv);


export interface IExecCallback {
    callback(error: Error,  stdout: string,  stderr: string): any;
}


*/


export class LineRec {
	constructor(
		public Filename		: string,
		public FileRow		: string,
		public FileCol		: string,
		public ErrorMess	: string,
		public ErrorCode	: string,
		public Message		: string
	){}
}


const error = chalk.bold.red;
const warning = chalk.keyword('orange');

console.log(error('Error!'));
console.log(warning('Warning!'));

export class TSIgniter {

	parsedLines: Array<LineRec>;

	constructor() {
		this.parsedLines = new Array<LineRec>();
	}

	/**
	 * Simply what is sounds like, this comment is just here to show you
	 * ans example of what the line can look like and here is how:
	 * "ActiveRec.ts(1989,19): error TS1128: Declaration or statement expected."
	 * @param line
	 */
    public parseLine(line: string) {
        var chunks = line.split(":");


        //////////////////////////////////////////////
        // Filename And Position Part

        var strFilenameAndPoint = chunks[0];
        var pointStart = strFilenameAndPoint.indexOf("(");
        var pointEnd = strFilenameAndPoint.indexOf(")");

        var linePoint = strFilenameAndPoint.substring(
			pointStart+1,
			pointEnd-1
        );

        var rowAndCol = linePoint.split(",");
        let resultFileRow = rowAndCol[0];
        let resultFileCol = rowAndCol[1];
        let resultFilename = strFilenameAndPoint.substring(0, pointStart);

        //////////////////////////////////////////////
        // Error Part

        var strError = chunks[1].trim();
        var errorAndCode = strError.split(" ");
        let resultErrorMess = errorAndCode[0];
        let resultErrorCode = errorAndCode[1];

        //////////////////////////////////////////////
        // Message Part

        let resultMessage = chunks[2].trim();


        //////////////////////////////////////////////
        // Assemble Record Class
        //
        // And yes this could have been done earlier
        // and save 4kb of memory per 12,56MB of data

        let lineRec = new LineRec(
							resultFilename,
							resultFileRow,
							resultFileCol,
							resultErrorMess,
							resultErrorCode,
							resultMessage
						);


        this.parsedLines.push(lineRec);

		/* Debug Outout if you like
        console.log("Filename:", resultFilename);
        console.log("   Row:", resultFileRow);
        console.log("   Col:", resultFileCol);
        console.log(" ");
        console.log("Error Message:", resultErrorMess);
        console.log("Error Code:", resultErrorCode);
        console.log(" ");
        console.log("Message", resultMessage);
        */
    }


    public Execute(command: string, callback: any) {
        var scope = this;
        exec(command, function(error: Error,  stdout: string,  stderr: string) {
            var dataArray = stdout.split(EOL);

            for (var i = 0; i < dataArray.length; i++) {
                var line = dataArray[i];
                scope.parseLine(line);
            }

            callback(stdout);
        });
    }

}

var igniter = new TSIgniter();


var status = new Spinner("Compiling...");
status.start();

igniter.parseLine2("ActiveRec.ts(1989,19): error TS1128: Declaration or statement expected.");


/*
igniter.Execute("tsc", function result(stdout: string) {
    console.log("Num errors", dataArray.length);
});
*/
status.stop();



//console.log(program.list);
