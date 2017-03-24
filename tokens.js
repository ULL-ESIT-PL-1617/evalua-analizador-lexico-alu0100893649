"use strict";

// Produce an array of simple token objects from a string.
// A simple token object contains these members:
//      type: 'name', 'string', 'number', 'operator'
//      value: string or number value of the token
//      from: index of first character of the token
//      to: index of the last character + 1

// Comments are ignored.

RegExp.prototype.bexec = function(str) {
  var i = this.lastIndex; //Da el índice en el que la string acaba según un patrón
  var m = this.exec(str); //Da el índice de la string en la que deja de hacer un match
  if (m && m.index == i) return m;
  return null;
}

String.prototype.tokens = function () {
    let from;                   // The index of the start of the token.
    let i = 0;                  // The index of the current character.
    let n;                      // The number value.
    let m;                      // Matching
    let result = [];            // An array to hold the results.

    const WHITES              = /\s+/g;
    const ID                  = /[aA-zZ]\W*/g;
    const NUM                 = /\b[-]?\d(\\.\d+)?([eE][-]?\d+)?\b/g;
    const STRING              = /('[^']*'|"[^"]*")/g;
    const ONELINECOMMENT      = /\/\/.*/g;
    const MULTIPLELINECOMMENT = /\/\*(.|\n)*\*\//g;
    const TWOCHAROPERATORS    = /(=== | !== | [+][+=] | -[-=] | =[=<>] | [<>][=<>] | && | [|][|])/g;
    const ONECHAROPERATORS    = /([-+*\/=()&|;:,<>{}[\]])/g; 
    const tokens = [WHITES, ID, NUM, STRING, ONELINECOMMENT, 
                  MULTIPLELINECOMMENT, TWOCHAROPERATORS, ONECHAROPERATORS ];


    // Make a token object.
    let make = function (type, value) {
        return {
            type: type,
            value: value,
            from: from,
            to: i
        };
    };

    let getTok = function() {
      let str = m[0];
      i += str.length; // Warning! side effect on i
      return str;
    };

    // Begin tokenization. If the source string is empty, return nothing.
    if (!this) return; 

    // Loop through this text
    while (i < this.length) {
        tokens.forEach( function(t) { t.lastIndex = i;} ); // Synchronize lastIndex for all regexp
        from = i;
        // Ignore whitespace and comments
        if (m = WHITES.bexec(this) || 
           (m = ONELINECOMMENT.bexec(this))  || 
           (m = MULTIPLELINECOMMENT.bexec(this))) { getTok(); }
        // name.
        else if (m = ID.bexec(this)) {
            result.push(make('id', getTok()));
        } 
        // number.
        else if (m = NUM.bexec(this)) {
            n = +getTok();

            if (isFinite(n)) {
                result.push(make('number', n));
            } else {
                make('number', m[0]).error("Bad number");
            }
        } 
        // string
        else if (m = STRING.bexec(this)) {
            result.push(make('string', getTok()).replace(/^['"]['"]$/g,''));
        } 
        // two char operator
        else if (m = TWOCHAROPERATORS.bexec(this)) {
            result.push(make('operator', getTok()));
        // single-character operator
        } else if (m = ONECHAROPERATORS.bexec(this)){
            result.push(make('operator', getTok()));
        } else {
          throw "Syntax error near '"+this.substr(i)+"'";
        }
    }
    return result;
};

