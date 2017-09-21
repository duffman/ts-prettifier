#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require('commander');
var chalk = require("chalk");
var clear = require("clear");
var CLI = require("clui");
var figlet = require("figlet");
var inquirer = require("inquirer");
var Preferences = require("preferences");
var _ = require("lodash");
var fs = require("fs");
var Spinner = CLI.Spinner;
var exec = require('child_process').exec;
var EOL = require('os').EOL;
var error = chalk.bold.red;
var warning = chalk.keyword('orange');
console.log(error('Error!'));
console.log(warning('Warning!'));
var ParserState;
(function (ParserState) {
    ParserState[ParserState["None"] = 1] = "None";
    ParserState[ParserState["FileName"] = 2] = "FileName";
    ParserState[ParserState["FilePosRow"] = 3] = "FilePosRow";
    ParserState[ParserState["FilePosCol"] = 4] = "FilePosCol";
    ParserState[ParserState["ErrorType"] = 5] = "ErrorType";
    ParserState[ParserState["ErrorCode"] = 6] = "ErrorCode";
    ParserState[ParserState["Message"] = 7] = "Message";
})(ParserState || (ParserState = {}));
var ParserChunk = (function () {
    function ParserChunk(state, Data) {
        this.state = state;
        this.Data = Data;
    }
    ;
    return ParserChunk;
}());
var TSIgniter = (function () {
    function TSIgniter() {
    }
    TSIgniter.prototype.isEqual = function (first, second) {
        var firstVal = first.valueOf();
        var secondVal = second.valueOf();
        console.log(firstVal, secondVal);
    };
    // "ActiveRec.ts(1989,19): error TS1128: Declaration or statement expected.";
    TSIgniter.prototype.parseLine2 = function (line) {
        var chunks = line.split(":");
        //////////////////////////////////////////////
        // Filename And Position Part
        var strFilenameAndPoint = chunks[0];
        var pointStart = strFilenameAndPoint.indexOf("(");
        var pointEnd = strFilenameAndPoint.indexOf(")");
        var linePoint = strFilenameAndPoint.substring(pointStart + 1, pointEnd - 1);
        var rowAndCol = linePoint.split(",");
        var resultErrorRow = rowAndCol[0];
        var resultErrorCol = rowAndCol[1];
        var resultFilename = strFilenameAndPoint.substring(0, pointStart);
        //////////////////////////////////////////////
        // Error Part
        var strError = chunks[1].trim();
        var errorAndCode = strError.split(" ");
        var resultError = errorAndCode[0];
        var resultErrorCode = errorAndCode[1];
        //////////////////////////////////////////////
        // Message Part
        var resultMessage = chunks[2].trim();
        //////////////////////////////////////////////
        // Debug Output
        console.log("Filename:", resultFilename);
        console.log("   Row:", resultErrorRow);
        console.log("   Col:", resultErrorCol);
        console.log(" ");
        console.log("Error Message:", resultError);
        console.log("Error Code:", resultErrorCode);
        console.log(" ");
        console.log("Message", resultMessage);
    };
    /**
     *
     * Example: "ActiveRec.ts(1989,19): error TS1128: Declaration or statement expected."
     * @param line
     */
    TSIgniter.prototype.parseLine = function (line) {
        line = "ActiveRec.ts(1989,19): error TS1128: Declaration or statement expected.";
        console.log(line);
        var parserChunks = new Array();
        var prevChar = "";
        var currChar = "";
        var textBlock = "";
        var prevState;
        var currState;
        prevState = ParserState.FileName;
        currState = ParserState.FileName;
        function setState(newState) {
            prevState = currState;
            currState = newState;
        }
        function pushState(newState) {
            var chunk = new ParserChunk(currState, textBlock);
            parserChunks.push(chunk);
            setState(newState);
            textBlock = "";
        }
        for (var i = 0; i < line.length; i++) {
            prevChar = currChar;
            currChar = line[i];
            if (this.isEqual(currState, ParserState.FileName) && currChar == "(") {
                console.log("FILENAME:", textBlock);
                pushState(ParserState.FilePosRow);
                continue;
            }
            if (this.isEqual(currState, ParserState.FilePosRow) && currChar == ",") {
                pushState(ParserState.FilePosCol);
                continue;
            }
            if (this.isEqual(currState, ParserState.FilePosCol) && currChar == ")") {
                pushState(ParserState.ErrorType);
                i++; // Skip the leading space
                continue;
            }
            if (this.isEqual(currState, ParserState.ErrorType) && currChar == " ") {
                pushState(ParserState.ErrorCode);
                continue;
            }
            if (this.isEqual(currState, ParserState.ErrorCode) && currChar == ":") {
                pushState(ParserState.Message);
                continue;
            }
            if (this.isEqual(currState, ParserState.Message) && (i + 1) == line.length) {
                pushState(ParserState.Message);
            }
            textBlock += currChar;
        }
        var parts = line.split(":");
        console.log(parts);
        if (parts.length < 3) {
            console.log("Wrong line format");
        }
        else {
            var filename = parts[0];
            var error = parts[1];
            var message = parts[2];
            console.log(filename);
        }
    };
    TSIgniter.prototype.Execute = function (command, callback) {
        var scope = this;
        exec(command, function (error, stdout, stderr) {
            var dataArray = stdout.split(EOL);
            for (var i = 0; i < dataArray.length; i++) {
                var line = dataArray[i];
                scope.parseLine(line);
            }
            callback(stdout);
        });
    };
    return TSIgniter;
}());
exports.TSIgniter = TSIgniter;
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
