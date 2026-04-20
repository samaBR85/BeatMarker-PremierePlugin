var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/stubs/globals.js
var init_globals = __esm({
  "src/stubs/globals.js"() {
    if (typeof TextDecoder === "undefined") {
      globalThis.TextDecoder = class TextDecoder {
        constructor(encoding = "utf-8") {
          this.encoding = encoding;
        }
        decode(buffer) {
          const bytes = new Uint8Array(buffer instanceof ArrayBuffer ? buffer : buffer.buffer ?? buffer);
          let str = "";
          for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
          return decodeURIComponent(escape(str));
        }
      };
    }
    if (typeof TextEncoder === "undefined") {
      globalThis.TextEncoder = class TextEncoder {
        encode(str) {
          const bytes = [];
          for (let i = 0; i < str.length; i++) bytes.push(str.charCodeAt(i));
          return new Uint8Array(bytes);
        }
      };
    }
  }
});

// node_modules/music-tempo/dist/node/OnsetDetection.js
var require_OnsetDetection = __commonJS({
  "node_modules/music-tempo/dist/node/OnsetDetection.js"(exports2, module2) {
    init_globals();
    (function(global, factory) {
      if (typeof define === "function" && define.amd) {
        define(["module", "exports"], factory);
      } else if (typeof exports2 !== "undefined") {
        factory(module2, exports2);
      } else {
        var mod = {
          exports: {}
        };
        factory(mod, mod.exports);
        global.OnsetDetection = mod.exports;
      }
    })(exports2, function(module3, exports3) {
      "use strict";
      Object.defineProperty(exports3, "__esModule", {
        value: true
      });
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      var _createClass = /* @__PURE__ */ (function() {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }
        return function(Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      })();
      var OnsetDetection = (function() {
        function OnsetDetection2() {
          _classCallCheck(this, OnsetDetection2);
        }
        _createClass(OnsetDetection2, null, [{
          key: "calculateSF",
          value: function calculateSF(audioData, fft) {
            var params = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
            if (typeof fft == "undefined") {
              throw new ReferenceError("fft is undefined");
            }
            if (typeof fft.getHammingWindow !== "function" || typeof fft.getSpectrum !== "function") {
              throw new ReferenceError("fft doesn't contain getHammingWindow or getSpectrum methods");
            }
            if (!Array.prototype.fill) {
              Array.prototype.fill = function(value2) {
                if (this == null) {
                  throw new TypeError("this is null or not defined");
                }
                var O = Object(this);
                var len = O.length >>> 0;
                var start = arguments[1];
                var relativeStart = start >> 0;
                var k2 = relativeStart < 0 ? Math.max(len + relativeStart, 0) : Math.min(relativeStart, len);
                var end = arguments[2];
                var relativeEnd = end === void 0 ? len : end >> 0;
                var final = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len);
                while (k2 < final) {
                  O[k2] = value2;
                  k2++;
                }
                return O;
              };
            }
            params.bufferSize = params.bufferSize || 2048;
            params.hopSize = params.hopSize || 441;
            var bufferSize = params.bufferSize, hopSize = params.hopSize;
            var k = Math.floor(Math.log(bufferSize) / Math.LN2);
            if (Math.pow(2, k) !== bufferSize) {
              throw "Invalid buffer size (" + bufferSize + "), must be power of 2";
            }
            var hammWindow = fft.getHammingWindow(bufferSize);
            var spectralFlux = [];
            var spectrumLength = bufferSize / 2 + 1;
            var previousSpectrum = new Array(spectrumLength);
            previousSpectrum.fill(0);
            var im = new Array(bufferSize);
            var length = audioData.length;
            var zerosStart = new Array(bufferSize - hopSize);
            zerosStart.fill(0);
            audioData = zerosStart.concat(audioData);
            var zerosEnd = new Array(bufferSize - audioData.length % hopSize);
            zerosEnd.fill(0);
            audioData = audioData.concat(zerosEnd);
            for (var wndStart = 0; wndStart < length; wndStart += hopSize) {
              var wndEnd = wndStart + bufferSize;
              var re = [];
              var _k = 0;
              for (var i = wndStart; i < wndEnd; i++) {
                re[_k] = hammWindow[_k] * audioData[i];
                _k++;
              }
              im.fill(0);
              fft.getSpectrum(re, im);
              var flux = 0;
              for (var j = 0; j < spectrumLength; j++) {
                var value = re[j] - previousSpectrum[j];
                flux += value < 0 ? 0 : value;
              }
              spectralFlux.push(flux);
              previousSpectrum = re;
            }
            return spectralFlux;
          }
        }, {
          key: "normalize",
          value: function normalize(data) {
            if (!Array.isArray(data)) {
              throw "Array expected";
            }
            if (data.length == 0) {
              throw "Array is empty";
            }
            var sum = 0;
            var squareSum = 0;
            for (var i = 0; i < data.length; i++) {
              sum += data[i];
              squareSum += data[i] * data[i];
            }
            var mean = sum / data.length;
            var standardDeviation = Math.sqrt((squareSum - sum * mean) / data.length);
            if (standardDeviation == 0) standardDeviation = 1;
            for (var _i = 0; _i < data.length; _i++) {
              data[_i] = (data[_i] - mean) / standardDeviation;
            }
          }
        }, {
          key: "findPeaks",
          value: function findPeaks(spectralFlux) {
            var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
            var length = spectralFlux.length;
            var sf = spectralFlux;
            var decayRate = params.decayRate || 0.84;
            var peakFindingWindow = params.peakFindingWindow || 6;
            var meanWndMultiplier = params.meanWndMultiplier || 3;
            var peakThreshold = params.peakThreshold || 0.35;
            var max = 0;
            var av = sf[0];
            var peaks = [];
            for (var i = 0; i < length; i++) {
              av = decayRate * av + (1 - decayRate) * sf[i];
              if (sf[i] < av) continue;
              var wndStart = i - peakFindingWindow;
              var wndEnd = i + peakFindingWindow + 1;
              if (wndStart < 0) wndStart = 0;
              if (wndEnd > length) wndEnd = length;
              if (av < sf[i]) av = sf[i];
              var isMax = true;
              for (var j = wndStart; j < wndEnd; j++) {
                if (sf[j] > sf[i]) isMax = false;
              }
              if (isMax) {
                var meanWndStart = i - peakFindingWindow * meanWndMultiplier;
                var meanWndEnd = i + peakFindingWindow;
                if (meanWndStart < 0) meanWndStart = 0;
                if (meanWndEnd > length) meanWndEnd = length;
                var sum = 0;
                var count = meanWndEnd - meanWndStart;
                for (var _j = meanWndStart; _j < meanWndEnd; _j++) {
                  sum += sf[_j];
                }
                if (sf[i] > sum / count + peakThreshold) {
                  peaks.push(i);
                }
              }
            }
            if (peaks.length < 2) {
              throw "Fail to find peaks";
            }
            return peaks;
          }
        }]);
        return OnsetDetection2;
      })();
      exports3.default = OnsetDetection;
      module3.exports = exports3["default"];
    });
  }
});

// node_modules/music-tempo/dist/node/TempoInduction.js
var require_TempoInduction = __commonJS({
  "node_modules/music-tempo/dist/node/TempoInduction.js"(exports2, module2) {
    init_globals();
    (function(global, factory) {
      if (typeof define === "function" && define.amd) {
        define(["module", "exports"], factory);
      } else if (typeof exports2 !== "undefined") {
        factory(module2, exports2);
      } else {
        var mod = {
          exports: {}
        };
        factory(mod, mod.exports);
        global.TempoInduction = mod.exports;
      }
    })(exports2, function(module3, exports3) {
      "use strict";
      Object.defineProperty(exports3, "__esModule", {
        value: true
      });
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      var _createClass = /* @__PURE__ */ (function() {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }
        return function(Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      })();
      var TempoInduction = (function() {
        function TempoInduction2() {
          _classCallCheck(this, TempoInduction2);
        }
        _createClass(TempoInduction2, null, [{
          key: "processRhythmicEvents",
          value: function processRhythmicEvents(events) {
            var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
            var widthTreshold = params.widthTreshold || 0.025, maxIOI = params.maxIOI || 2.5, minIOI = params.minIOI || 0.07, length = events.length;
            var clIntervals = [], clSizes = [], clCount = 0;
            for (var i = 0; i < length - 1; i++) {
              for (var j = i + 1; j < length; j++) {
                var ioi = events[j] - events[i];
                if (ioi < minIOI) {
                  continue;
                }
                if (ioi > maxIOI) {
                  break;
                }
                var k = 0;
                for (; k < clCount; k++) {
                  if (Math.abs(clIntervals[k] - ioi) < widthTreshold) {
                    if (Math.abs(clIntervals[k + 1] - ioi) < Math.abs(clIntervals[k] - ioi) && k < clCount - 1) {
                      k++;
                    }
                    clIntervals[k] = (clIntervals[k] * clSizes[k] + ioi) / (clSizes[k] + 1);
                    clSizes[k]++;
                    break;
                  }
                }
                if (k != clCount) continue;
                clCount++;
                for (; k > 0 && clIntervals[k - 1] > ioi; k--) {
                  clIntervals[k] = clIntervals[k - 1];
                  clSizes[k] = clSizes[k - 1];
                }
                clIntervals[k] = ioi;
                clSizes[k] = 1;
              }
            }
            if (clCount == 0) {
              throw "Fail to find IOIs";
            }
            clIntervals.length = clCount;
            clSizes.length = clCount;
            return { clIntervals, clSizes };
          }
        }, {
          key: "mergeClusters",
          value: function mergeClusters(clusters) {
            var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
            var widthTreshold = params.widthTreshold || 0.025;
            var clIntervals = clusters.clIntervals, clSizes = clusters.clSizes;
            var clCount = clIntervals.length;
            for (var i = 0; i < clCount; i++) {
              for (var j = i + 1; j < clCount; j++) {
                if (Math.abs(clIntervals[i] - clIntervals[j]) < widthTreshold) {
                  clIntervals[i] = (clIntervals[i] * clSizes[i] + clIntervals[j] * clSizes[j]) / (clSizes[i] + clSizes[j]);
                  clSizes[i] = clSizes[i] + clSizes[j];
                  --clCount;
                  for (var k = j + 1; k <= clCount; k++) {
                    clIntervals[k - 1] = clIntervals[k];
                    clSizes[k - 1] = clSizes[k];
                  }
                }
              }
            }
            clIntervals.length = clCount;
            clSizes.length = clCount;
            return { clIntervals, clSizes };
          }
        }, {
          key: "calculateScore",
          value: function calculateScore(clusters) {
            var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
            var widthTreshold = params.widthTreshold || 0.025;
            var maxTempos = params.maxTempos || 10;
            var clIntervals = clusters.clIntervals, clSizes = clusters.clSizes, clScores = [], clScoresIdxs = [];
            var clCount = clIntervals.length;
            for (var i = 0; i < clCount; i++) {
              clScores[i] = 10 * clSizes[i];
              clScoresIdxs[i] = { score: clScores[i], idx: i };
            }
            clScoresIdxs.sort(function(a, b) {
              return b.score - a.score;
            });
            if (clScoresIdxs.length > maxTempos) {
              for (var _i = maxTempos - 1; _i < clScoresIdxs.length - 1; _i++) {
                if (clScoresIdxs[_i].score == clScoresIdxs[_i + 1].score) {
                  maxTempos++;
                } else {
                  break;
                }
              }
              clScoresIdxs.length = maxTempos;
            }
            clScoresIdxs = clScoresIdxs.map(function(a) {
              return a.idx;
            });
            for (var _i2 = 0; _i2 < clCount; _i2++) {
              for (var j = _i2 + 1; j < clCount; j++) {
                var ratio = clIntervals[_i2] / clIntervals[j];
                var isFraction = ratio < 1;
                var d = void 0, err2 = void 0;
                d = isFraction ? Math.round(1 / ratio) : Math.round(ratio);
                if (d < 2 || d > 8) continue;
                if (isFraction) err2 = Math.abs(clIntervals[_i2] * d - clIntervals[j]);
                else err2 = Math.abs(clIntervals[_i2] - clIntervals[j] * d);
                var errTreshold = isFraction ? widthTreshold : widthTreshold * d;
                if (err2 >= errTreshold) continue;
                d = d >= 5 ? 1 : 6 - d;
                clScores[_i2] += d * clSizes[j];
                clScores[j] += d * clSizes[_i2];
              }
            }
            return { clScores, clScoresIdxs };
          }
        }, {
          key: "createTempoList",
          value: function createTempoList(clusters) {
            var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
            var widthTreshold = params.widthTreshold || 0.025, minBeatInterval = params.minBeatInterval || 0.3, maxBeatInterval = params.maxBeatInterval || 1;
            var clIntervals = clusters.clIntervals, clSizes = clusters.clSizes, clScores = clusters.clScores, clScoresIdxs = clusters.clScoresIdxs, tempoList = [];
            var clCount = clIntervals.length;
            for (var i = 0; i < clScoresIdxs.length; i++) {
              var idx = clScoresIdxs[i];
              var newSum = clIntervals[idx] * clScores[idx];
              var newWeight = clScores[idx];
              var err2 = void 0, errTreshold = void 0;
              for (var j = 0; j < clCount; j++) {
                if (j == idx) continue;
                var ratio = clIntervals[idx] / clIntervals[j];
                var isFraction = ratio < 1;
                var sumInc = 0;
                var d = isFraction ? Math.round(1 / ratio) : Math.round(ratio);
                if (d < 2 || d > 8) continue;
                if (isFraction) {
                  err2 = Math.abs(clIntervals[idx] * d - clIntervals[j]);
                  errTreshold = widthTreshold;
                } else {
                  err2 = Math.abs(clIntervals[idx] - d * clIntervals[j]);
                  errTreshold = widthTreshold * d;
                }
                if (err2 >= errTreshold) continue;
                if (isFraction) {
                  newSum += clIntervals[j] / d * clScores[j];
                } else {
                  newSum += clIntervals[j] * d * clScores[j];
                }
                newWeight += clScores[j];
              }
              var beat = newSum / newWeight;
              while (beat < minBeatInterval) {
                beat *= 2;
              }
              while (beat > maxBeatInterval) {
                beat /= 2;
              }
              tempoList.push(beat);
            }
            return tempoList;
          }
        }]);
        return TempoInduction2;
      })();
      exports3.default = TempoInduction;
      module3.exports = exports3["default"];
    });
  }
});

// node_modules/music-tempo/dist/node/Agent.js
var require_Agent = __commonJS({
  "node_modules/music-tempo/dist/node/Agent.js"(exports2, module2) {
    init_globals();
    (function(global, factory) {
      if (typeof define === "function" && define.amd) {
        define(["module", "exports"], factory);
      } else if (typeof exports2 !== "undefined") {
        factory(module2, exports2);
      } else {
        var mod = {
          exports: {}
        };
        factory(mod, mod.exports);
        global.Agent = mod.exports;
      }
    })(exports2, function(module3, exports3) {
      "use strict";
      Object.defineProperty(exports3, "__esModule", {
        value: true
      });
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      var _createClass = /* @__PURE__ */ (function() {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }
        return function(Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      })();
      var Agent = (function() {
        function Agent2(tempo, firstBeatTime, firsteventScore, agentList) {
          var params = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {};
          _classCallCheck(this, Agent2);
          this.expiryTime = params.expiryTime || 10;
          this.toleranceWndInner = params.toleranceWndInner || 0.04;
          this.toleranceWndPre = params.toleranceWndPre || 0.15;
          this.toleranceWndPost = params.toleranceWndPost || 0.3;
          this.toleranceWndPre *= tempo;
          this.toleranceWndPost *= tempo;
          this.correctionFactor = params.correctionFactor || 50;
          this.maxChange = params.maxChange || 0.2;
          this.penaltyFactor = params.penaltyFactor || 0.5;
          this.beatInterval = tempo;
          this.initialBeatInterval = tempo;
          this.beatTime = firstBeatTime;
          this.totalBeatCount = 1;
          this.events = [firstBeatTime];
          this.score = firsteventScore;
          this.agentListRef = agentList;
        }
        _createClass(Agent2, [{
          key: "considerEvent",
          value: function considerEvent(eventTime, eventScore) {
            if (eventTime - this.events[this.events.length - 1] > this.expiryTime) {
              this.score = -1;
              return false;
            }
            var beatCount = Math.round((eventTime - this.beatTime) / this.beatInterval);
            var err2 = eventTime - this.beatTime - beatCount * this.beatInterval;
            if (beatCount > 0 && err2 >= -this.toleranceWndPre && err2 <= this.toleranceWndPost) {
              if (Math.abs(err2) > this.toleranceWndInner) {
                this.agentListRef.push(this.clone());
              }
              this.acceptEvent(eventTime, eventScore, err2, beatCount);
              return true;
            }
            return false;
          }
        }, {
          key: "acceptEvent",
          value: function acceptEvent(eventTime, eventScore, err2, beatCount) {
            this.beatTime = eventTime;
            this.events.push(eventTime);
            var corrErr = err2 / this.correctionFactor;
            if (Math.abs(this.initialBeatInterval - this.beatInterval - corrErr) < this.maxChange * this.initialBeatInterval) {
              this.beatInterval += corrErr;
            }
            this.totalBeatCount += beatCount;
            var errFactor = err2 > 0 ? err2 / this.toleranceWndPost : err2 / -this.toleranceWndPre;
            var scoreFactor = 1 - this.penaltyFactor * errFactor;
            this.score += eventScore * scoreFactor;
          }
        }, {
          key: "fillBeats",
          value: function fillBeats() {
            var prevBeat = void 0, nextBeat = void 0, currentInterval = void 0, beats = void 0;
            prevBeat = 0;
            if (this.events.length > 2) {
              prevBeat = this.events[0];
            }
            for (var i = 0; i < this.events.length; i++) {
              nextBeat = this.events[i];
              beats = Math.round((nextBeat - prevBeat) / this.beatInterval - 0.01);
              currentInterval = (nextBeat - prevBeat) / beats;
              var k = 0;
              for (; beats > 1; beats--) {
                prevBeat += currentInterval;
                this.events.splice(i + k, 0, prevBeat);
                k++;
              }
              prevBeat = nextBeat;
            }
          }
        }, {
          key: "clone",
          value: function clone() {
            var newAgent = new Agent2();
            newAgent.beatInterval = this.beatInterval;
            newAgent.initialBeatInterval = this.initialBeatInterval;
            newAgent.beatTime = this.beatTime;
            newAgent.totalBeatCount = this.totalBeatCount;
            newAgent.events = this.events.slice();
            newAgent.expiryTime = this.expiryTime;
            newAgent.toleranceWndInner = this.toleranceWndInner;
            newAgent.toleranceWndPre = this.toleranceWndPre;
            newAgent.toleranceWndPost = this.toleranceWndPost;
            newAgent.correctionFactor = this.correctionFactor;
            newAgent.maxChange = this.maxChange;
            newAgent.penaltyFactor = this.penaltyFactor;
            newAgent.score = this.score;
            newAgent.agentListRef = this.agentListRef;
            return newAgent;
          }
        }]);
        return Agent2;
      })();
      exports3.default = Agent;
      module3.exports = exports3["default"];
    });
  }
});

// node_modules/music-tempo/dist/node/BeatTracking.js
var require_BeatTracking = __commonJS({
  "node_modules/music-tempo/dist/node/BeatTracking.js"(exports2, module2) {
    init_globals();
    (function(global, factory) {
      if (typeof define === "function" && define.amd) {
        define(["module", "exports", "./Agent"], factory);
      } else if (typeof exports2 !== "undefined") {
        factory(module2, exports2, require_Agent());
      } else {
        var mod = {
          exports: {}
        };
        factory(mod, mod.exports, global.Agent);
        global.BeatTracking = mod.exports;
      }
    })(exports2, function(module3, exports3, _Agent) {
      "use strict";
      Object.defineProperty(exports3, "__esModule", {
        value: true
      });
      var _Agent2 = _interopRequireDefault(_Agent);
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      var _createClass = /* @__PURE__ */ (function() {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }
        return function(Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      })();
      var BeatTracking = (function() {
        function BeatTracking2() {
          _classCallCheck(this, BeatTracking2);
        }
        _createClass(BeatTracking2, null, [{
          key: "trackBeat",
          value: function trackBeat(events, eventsScores, tempoList) {
            var params = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
            var initPeriod = params.initPeriod || 5, thresholdBI = params.thresholdBI || 0.02, thresholdBT = params.thresholdBT || 0.04;
            function removeSimilarAgents() {
              agents.sort(function(a1, a2) {
                return a1.beatInterval - a2.beatInterval;
              });
              var length = agents.length;
              for (var i2 = 0; i2 < length; i2++) {
                if (agents[i2].score < 0) continue;
                for (var _j = i2 + 1; _j < length; _j++) {
                  if (agents[_j].beatInterval - agents[i2].beatInterval > thresholdBI) {
                    break;
                  }
                  if (Math.abs(agents[_j].beatTime - agents[i2].beatTime) > thresholdBT) {
                    continue;
                  }
                  if (agents[i2].score < agents[_j].score) {
                    agents[i2].score = -1;
                  } else {
                    agents[_j].score = -1;
                  }
                }
              }
              for (var _i = length - 1; _i >= 0; _i--) {
                if (agents[_i].score < 0) {
                  agents.splice(_i, 1);
                }
              }
            }
            var agents = [];
            for (var i = 0; i < tempoList.length; i++) {
              agents.push(new _Agent2.default(tempoList[i], events[0], eventsScores[0], agents, params));
            }
            var j = 1;
            removeSimilarAgents();
            while (events[j] < initPeriod) {
              var agentsLength = agents.length;
              var prevBeatInterval = -1;
              var isEventAccepted = true;
              for (var k = 0; k < agentsLength; k++) {
                if (agents[k].beatInterval != prevBeatInterval) {
                  if (!isEventAccepted) {
                    agents.push(new _Agent2.default(prevBeatInterval, events[j], eventsScores[j], agents, params));
                  }
                  prevBeatInterval = agents[k].beatInterval;
                  isEventAccepted = false;
                }
                isEventAccepted = agents[k].considerEvent(events[j], eventsScores[j]) || isEventAccepted;
              }
              removeSimilarAgents();
              j++;
            }
            var eventsLength = events.length;
            for (var _i2 = j; _i2 < eventsLength; _i2++) {
              var _agentsLength = agents.length;
              for (var _j2 = 0; _j2 < _agentsLength; _j2++) {
                agents[_j2].considerEvent(events[_i2], eventsScores[_i2]);
              }
              removeSimilarAgents();
            }
            return agents;
          }
        }]);
        return BeatTracking2;
      })();
      exports3.default = BeatTracking;
      module3.exports = exports3["default"];
    });
  }
});

// node_modules/music-tempo/dist/node/FFT.js
var require_FFT = __commonJS({
  "node_modules/music-tempo/dist/node/FFT.js"(exports2, module2) {
    init_globals();
    (function(global, factory) {
      if (typeof define === "function" && define.amd) {
        define(["module", "exports"], factory);
      } else if (typeof exports2 !== "undefined") {
        factory(module2, exports2);
      } else {
        var mod = {
          exports: {}
        };
        factory(mod, mod.exports);
        global.FFT = mod.exports;
      }
    })(exports2, function(module3, exports3) {
      "use strict";
      Object.defineProperty(exports3, "__esModule", {
        value: true
      });
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      var _createClass = /* @__PURE__ */ (function() {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }
        return function(Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      })();
      var FFT = (function() {
        function FFT2() {
          _classCallCheck(this, FFT2);
        }
        _createClass(FFT2, null, [{
          key: "getHammingWindow",
          value: function getHammingWindow(bufferSize) {
            var a = 25 / 46;
            var b = 21 / 46;
            var scale = 1 / bufferSize / 0.54;
            var sqrtBufferSize = Math.sqrt(bufferSize);
            var factor = Math.PI * 2 / bufferSize;
            var wnd = [];
            for (var i = 0; i < bufferSize; i++) {
              wnd[i] = sqrtBufferSize * (scale * (a - b * Math.cos(factor * i)));
            }
            return wnd;
          }
        }, {
          key: "getSpectrum",
          value: function getSpectrum(re, im) {
            var direction = -1;
            var n = re.length;
            var bits = Math.round(Math.log(n) / Math.log(2));
            var twoPI = Math.PI * 2;
            if (n != 1 << bits) throw new Error("FFT data must be power of 2");
            var localN = void 0;
            var j = 0;
            for (var i = 0; i < n - 1; i++) {
              if (i < j) {
                var temp = re[j];
                re[j] = re[i];
                re[i] = temp;
                temp = im[j];
                im[j] = im[i];
                im[i] = temp;
              }
              var k = n / 2;
              while (k >= 1 && k - 1 < j) {
                j = j - k;
                k = k / 2;
              }
              j = j + k;
            }
            for (var m = 1; m <= bits; m++) {
              localN = 1 << m;
              var Wjk_r = 1;
              var Wjk_i = 0;
              var theta = twoPI / localN;
              var Wj_r = Math.cos(theta);
              var Wj_i = direction * Math.sin(theta);
              var nby2 = localN / 2;
              for (j = 0; j < nby2; j++) {
                for (var _k = j; _k < n; _k += localN) {
                  var id = _k + nby2;
                  var tempr = Wjk_r * re[id] - Wjk_i * im[id];
                  var tempi = Wjk_r * im[id] + Wjk_i * re[id];
                  re[id] = re[_k] - tempr;
                  im[id] = im[_k] - tempi;
                  re[_k] += tempr;
                  im[_k] += tempi;
                }
                var wtemp = Wjk_r;
                Wjk_r = Wj_r * Wjk_r - Wj_i * Wjk_i;
                Wjk_i = Wj_r * Wjk_i + Wj_i * wtemp;
              }
            }
            for (var _i = 0; _i < re.length; _i++) {
              var pow = re[_i] * re[_i] + im[_i] * im[_i];
              re[_i] = pow;
            }
            for (var _i2 = 0; _i2 < re.length; _i2++) {
              re[_i2] = Math.sqrt(re[_i2]);
            }
          }
        }]);
        return FFT2;
      })();
      exports3.default = FFT;
      module3.exports = exports3["default"];
    });
  }
});

// node_modules/music-tempo/dist/node/MusicTempo.js
var require_MusicTempo = __commonJS({
  "node_modules/music-tempo/dist/node/MusicTempo.js"(exports2, module2) {
    init_globals();
    (function(global, factory) {
      if (typeof define === "function" && define.amd) {
        define(["module", "exports", "./OnsetDetection", "./TempoInduction", "./BeatTracking", "./FFT"], factory);
      } else if (typeof exports2 !== "undefined") {
        factory(module2, exports2, require_OnsetDetection(), require_TempoInduction(), require_BeatTracking(), require_FFT());
      } else {
        var mod = {
          exports: {}
        };
        factory(mod, mod.exports, global.OnsetDetection, global.TempoInduction, global.BeatTracking, global.FFT);
        global.MusicTempo = mod.exports;
      }
    })(exports2, function(module3, exports3, _OnsetDetection, _TempoInduction, _BeatTracking, _FFT) {
      "use strict";
      Object.defineProperty(exports3, "__esModule", {
        value: true
      });
      var _OnsetDetection2 = _interopRequireDefault(_OnsetDetection);
      var _TempoInduction2 = _interopRequireDefault(_TempoInduction);
      var _BeatTracking2 = _interopRequireDefault(_BeatTracking);
      var _FFT2 = _interopRequireDefault(_FFT);
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      var MusicTempo2 = (
        /**
         * Constructor
         * @param {Float32Array} audioData - non-interleaved IEEE 32-bit linear PCM with a nominal range of -1 -> +1 (Web Audio API - Audio Buffer)
         * @param {Object} [params={}] - parameters
         * @param {Number} [params.bufferSize=2048] - FFT windows size
         * @param {Number} [params.hopSize=441] - spacing of audio frames in samples
         * @param {Number} [params.decayRate=0.84] - how quickly previous peaks are forgotten
         * @param {Number} [params.peakFindingWindow=6] - minimum distance between peaks
         * @param {Number} [params.meanWndMultiplier=3] - multiplier for peak finding window
         * @param {Number} [params.peakThreshold=0.35] - minimum value of peaks
         * @param {Number} [params.widthTreshold=0.025] - the maximum difference in IOIs which are in the same cluster
         * @param {Number} [params.maxIOI=2.5] - the maximum IOI for inclusion in a cluster
         * @param {Number} [params.minIOI=0.07] - the minimum IOI for inclusion in a cluster
         * @param {Number} [params.maxTempos=10] - initial amount of tempo hypotheses
         * @param {Number} [params.minBeatInterval=0.3] - the minimum inter-beat interval (IBI) (0.30 seconds == 200 BPM)
         * @param {Number} [params.maxBeatInterval=1] - the maximum inter-beat interval (IBI) (1.00 seconds ==  60 BPM)
         * @param {Number} [params.initPeriod=5] - duration of the initial section
         * @param {Number} [params.thresholdBI=0.02] - for the purpose of removing duplicate agents, the default JND of IBI
         * @param {Number} [params.thresholdBT=0.04] - for the purpose of removing duplicate agents, the default JND of phase
         * @param {Number} [params.expiryTime=10] - the time after which an Agent that has not accepted any beat will be destroyed
         * @param {Number} [params.toleranceWndInner=0.04] - the maximum time that a beat can deviate from the predicted beat time without a fork occurring
         * @param {Number} [params.toleranceWndPre=0.15] - the maximum amount by which a beat can be earlier than the predicted beat time, expressed as a fraction of the beat period
         * @param {Number} [params.toleranceWndPost=0.3] - the maximum amount by which a beat can be later than the predicted beat time, expressed as a fraction of the beat period
         * @param {Number} [params.correctionFactor=50] - correction factor for updating beat period
         * @param {Number} [params.maxChange=0.2] - the maximum allowed deviation from the initial tempo, expressed as a fraction of the initial beat period
         * @param {Number} [params.penaltyFactor=0.5] - factor for correcting score, if onset do not coincide precisely with predicted beat time
         */
        function MusicTempo3(audioData) {
          var _this = this;
          var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          _classCallCheck(this, MusicTempo3);
          if (audioData instanceof Float32Array) {
            if (!Array.from) {
              Array.from = (function() {
                var toStr = Object.prototype.toString;
                var isCallable = function isCallable2(fn) {
                  return typeof fn === "function" || toStr.call(fn) === "[object Function]";
                };
                var toInteger = function toInteger2(value) {
                  var number = Number(value);
                  if (isNaN(number)) {
                    return 0;
                  }
                  if (number === 0 || !isFinite(number)) {
                    return number;
                  }
                  return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
                };
                var maxSafeInteger = Math.pow(2, 53) - 1;
                var toLength = function toLength2(value) {
                  var len = toInteger(value);
                  return Math.min(Math.max(len, 0), maxSafeInteger);
                };
                return function from(arrayLike) {
                  var C = this;
                  var items = Object(arrayLike);
                  if (arrayLike == null) {
                    throw new TypeError("Array.from requires an array-like object - not null or undefined");
                  }
                  var mapFn = arguments.length > 1 ? arguments[1] : void 0;
                  var T;
                  if (typeof mapFn !== "undefined") {
                    if (!isCallable(mapFn)) {
                      throw new TypeError("Array.from: when provided, the second argument must be a function");
                    }
                    if (arguments.length > 2) {
                      T = arguments[2];
                    }
                  }
                  var len = toLength(items.length);
                  var A = isCallable(C) ? Object(new C(len)) : new Array(len);
                  var k = 0;
                  var kValue;
                  while (k < len) {
                    kValue = items[k];
                    if (mapFn) {
                      A[k] = typeof T === "undefined" ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                    } else {
                      A[k] = kValue;
                    }
                    k += 1;
                  }
                  A.length = len;
                  return A;
                };
              })();
            }
            audioData = Array.from(audioData);
          } else if (!Array.isArray(audioData)) {
            throw "audioData is not an array";
          }
          var timeStep = params.timeStep || 0.01;
          var res = _OnsetDetection2.default.calculateSF(audioData, _FFT2.default, params);
          this.spectralFlux = res;
          _OnsetDetection2.default.normalize(this.spectralFlux);
          this.peaks = _OnsetDetection2.default.findPeaks(this.spectralFlux, params);
          this.events = this.peaks.map(function(a) {
            return a * timeStep;
          });
          var clusters = _TempoInduction2.default.processRhythmicEvents(this.events, params);
          clusters = _TempoInduction2.default.mergeClusters(clusters, params);
          var scores = _TempoInduction2.default.calculateScore(clusters, params);
          clusters = {
            clIntervals: clusters.clIntervals,
            clSizes: clusters.clSizes,
            clScores: scores.clScores,
            clScoresIdxs: scores.clScoresIdxs
          };
          this.tempoList = _TempoInduction2.default.createTempoList(clusters, params);
          var minSFValue = this.spectralFlux.reduce(function(a, b) {
            return Math.min(a, b);
          });
          var eventsScores = this.peaks.map(function(a) {
            return _this.spectralFlux[a] - minSFValue;
          });
          this.agents = _BeatTracking2.default.trackBeat(this.events, eventsScores, this.tempoList, params);
          var bestScore = -1;
          var idxBestAgent = -1;
          this.tempo = -1;
          this.beats = [];
          this.beatInterval = -1;
          for (var i = 0; i < this.agents.length; i++) {
            if (this.agents[i].score > bestScore) {
              bestScore = this.agents[i].score;
              idxBestAgent = i;
            }
          }
          if (this.agents[idxBestAgent]) {
            this.bestAgent = this.agents[idxBestAgent];
            this.bestAgent.fillBeats();
            this.tempo = (60 / this.bestAgent.beatInterval).toFixed(3);
            this.beatInterval = this.bestAgent.beatInterval;
            this.beats = this.bestAgent.events;
          }
          if (this.tempo == -1) {
            throw "Tempo extraction failed";
          }
        }
      );
      exports3.default = MusicTempo2;
      module3.exports = exports3["default"];
    });
  }
});

// node_modules/js-mp3/src/consts.js
var require_consts = __commonJS({
  "node_modules/js-mp3/src/consts.js"(exports2, module2) {
    init_globals();
    var consts = {
      Version2_5: 0,
      VersionReserved: 1,
      Version2: 2,
      Version1: 3,
      LayerReserved: 0,
      Layer3: 1,
      Layer2: 2,
      Layer1: 3,
      ModeStereo: 0,
      ModeJointStereo: 1,
      ModeDualChannel: 2,
      ModeSingleChannel: 3,
      SamplesPerGr: 576,
      SamplingFrequency44100: 0,
      SamplingFrequency48000: 1,
      SamplingFrequency32000: 2,
      SamplingFrequencyReserved: 3,
      newSamplingFrequencyInstance: function(value) {
        var instance = {
          value
        };
        instance.Int = function() {
          switch (instance.value) {
            case consts.SamplingFrequency44100:
              return 44100;
            case consts.SamplingFrequency48000:
              return 48e3;
            case consts.SamplingFrequency32000:
              return 32e3;
          }
          throw new Error("not reached");
        };
        return instance;
      },
      SfBandIndicesSet: {
        0: {
          // SamplingFrequency44100
          L: [0, 4, 8, 12, 16, 20, 24, 30, 36, 44, 52, 62, 74, 90, 110, 134, 162, 196, 238, 288, 342, 418, 576],
          S: [0, 4, 8, 12, 16, 22, 30, 40, 52, 66, 84, 106, 136, 192]
        },
        1: {
          // SamplingFrequency48000
          L: [0, 4, 8, 12, 16, 20, 24, 30, 36, 42, 50, 60, 72, 88, 106, 128, 156, 190, 230, 276, 330, 384, 576],
          S: [0, 4, 8, 12, 16, 22, 28, 38, 50, 64, 80, 100, 126, 192]
        },
        2: {
          // SamplingFrequency32000
          L: [0, 4, 8, 12, 16, 20, 24, 30, 36, 44, 54, 66, 82, 102, 126, 156, 194, 240, 296, 364, 448, 550, 576],
          S: [0, 4, 8, 12, 16, 22, 30, 42, 58, 78, 104, 138, 180, 192]
        }
      }
    };
    consts.BytesPerFrame = consts.SamplesPerGr * 2 * 4;
    module2.exports = consts;
  }
});

// node_modules/js-mp3/src/util.js
var require_util = __commonJS({
  "node_modules/js-mp3/src/util.js"(exports2, module2) {
    init_globals();
    function init2dArray(root, prop, first, second) {
      root[prop] = [];
      for (var i = 0; i < first; i++) {
        root[prop].push([]);
      }
      for (var i = 0; i < root[prop].length; i++) {
        for (var j = 0; j < second; j++) {
          root[prop][i].push(0);
        }
      }
    }
    function init3dArray(root, prop, first, second, third) {
      root[prop] = [];
      for (var i = 0; i < first; i++) {
        root[prop].push([]);
      }
      for (var i = 0; i < root[prop].length; i++) {
        for (var j = 0; j < second; j++) {
          root[prop][i].push([]);
        }
        for (var x = 0; x < root[prop][i].length; x++) {
          for (var y = 0; y < third; y++) {
            root[prop][i][x].push(0);
          }
        }
      }
    }
    function init4dArray(root, prop, first, second, third, fourth) {
      root[prop] = [];
      for (var i = 0; i < first; i++) {
        root[prop].push([]);
      }
      for (var i = 0; i < root[prop].length; i++) {
        for (var j = 0; j < second; j++) {
          root[prop][i].push([]);
        }
        for (var x = 0; x < root[prop][i].length; x++) {
          for (var y = 0; y < third; y++) {
            var a = [];
            for (var z = 0; z < fourth; z++) {
              a.push(0);
            }
            root[prop][i][x].push(a);
          }
        }
      }
    }
    function concatTypedArrays(a, b) {
      var c = new a.constructor(a.length + b.length);
      c.set(a, 0);
      c.set(b, a.length);
      return c;
    }
    function concatBuffers(a, b) {
      return concatTypedArrays(
        new Uint8Array((!!a ? a.buffer : new ArrayBuffer(0)) || a),
        new Uint8Array((!!b ? b.buffer : new ArrayBuffer(0)) || b)
      ).buffer;
    }
    function concatBytes(ui8a, byte) {
      var b = new Uint8Array(1);
      b[0] = byte;
      return concatTypedArrays(ui8a, b);
    }
    function len(v) {
      if (typeof v === "object") {
        return v.length;
      }
      return 0;
    }
    module2.exports = {
      init2dArray,
      init3dArray,
      init4dArray,
      concatTypedArrays,
      concatBuffers,
      concatBytes,
      len,
      string: {
        bin: function(v) {
          return parseInt(v);
        }
      },
      number: {
        bin: function(v) {
          var sign = v < 0 ? "-" : "";
          var result = Math.abs(v).toString(2);
          while (result.length < 32) {
            result = "0" + result;
          }
          return sign + result;
        }
      }
    };
  }
});

// node_modules/js-mp3/src/frameheader.js
var require_frameheader = __commonJS({
  "node_modules/js-mp3/src/frameheader.js"(exports2, module2) {
    init_globals();
    var consts = require_consts();
    var Frameheader = {
      createNew: function(value) {
        var fh = {
          value
        };
        fh.id = function() {
          return (fh.value & 1572864) >>> 19 >>> 0;
        };
        fh.layer = function() {
          return (fh.value & 393216) >>> 17 >>> 0;
        };
        fh.protectionBit = function() {
          return (fh.value & 65536) >>> 16 >>> 0;
        };
        fh.bitrateIndex = function() {
          return (fh.value & 61440) >>> 12 >>> 0;
        };
        fh.samplingFrequency = function() {
          return consts.newSamplingFrequencyInstance((fh.value & 3072) >>> 10 >>> 0);
        };
        fh.paddingBit = function() {
          return (fh.value & 512) >>> 9 >>> 0;
        };
        fh.privateBit = function() {
          return (fh.value & 256) >>> 8 >>> 0;
        };
        fh.mode = function() {
          return (fh.value & 192) >>> 6 >>> 0;
        };
        fh.modeExtension = function() {
          return (fh.value & 48) >>> 4 >>> 0;
        };
        fh.useMSStereo = function() {
          if (fh.mode() !== consts.ModeJointStereo) {
            return false;
          }
          return (fh.modeExtension() & 2) !== 0;
        };
        fh.useIntensityStereo = function() {
          if (fh.mode() !== consts.ModeJointStereo) {
            return false;
          }
          return (fh.modeExtension() & 1) !== 0;
        };
        fh.copyright = function() {
          return (fh.value & 8) >>> 3 >>> 0;
        };
        fh.originalOrCopy = function() {
          return (fh.value & 4) >>> 2 >>> 0;
        };
        fh.emphasis = function() {
          return (fh.value & 3) >>> 0;
        };
        fh.isValid = function() {
          const sync = 4292870144;
          if ((fh.value & sync) >>> 0 !== sync) {
            return false;
          }
          if (fh.id() === consts.VersionReserved) {
            return false;
          }
          if (fh.bitrateIndex() === 15) {
            return false;
          }
          if (fh.samplingFrequency().value === consts.SamplingFrequencyReserved) {
            return false;
          }
          if (fh.layer() === consts.LayerReserved) {
            return false;
          }
          if (fh.emphasis() === 2) {
            return false;
          }
          return true;
        };
        fh.frameSize = function() {
          var value2 = 144 * Frameheader.bitrate(fh.layer(), fh.bitrateIndex()) / fh.samplingFrequency().Int() + fh.paddingBit();
          return Math.floor(value2);
        };
        fh.numberOfChannels = function() {
          if (fh.mode() === consts.ModeSingleChannel) {
            return 1;
          }
          return 2;
        };
        return fh;
      },
      bitrate: function(layer, index) {
        switch (layer) {
          case consts.Layer1:
            return [
              0,
              32e3,
              64e3,
              96e3,
              128e3,
              16e4,
              192e3,
              224e3,
              256e3,
              288e3,
              32e4,
              352e3,
              384e3,
              416e3,
              448e3
            ][index];
          case consts.Layer2:
            return [
              0,
              32e3,
              48e3,
              56e3,
              64e3,
              8e4,
              96e3,
              112e3,
              128e3,
              16e4,
              192e3,
              224e3,
              256e3,
              32e4,
              384e3
            ][index];
          case consts.Layer3:
            return [
              0,
              32e3,
              4e4,
              48e3,
              56e3,
              64e3,
              8e4,
              96e3,
              112e3,
              128e3,
              16e4,
              192e3,
              224e3,
              256e3,
              32e4
            ][index];
        }
        throw new Error("not reached");
      },
      read: function(source, position) {
        var pos = position;
        var result = source.readFull(4);
        if (result.err) {
          return {
            err: result.err
          };
        }
        var buf = result.buf;
        if (buf.byteLength < 4) {
          return {
            h: 0,
            position: 0,
            err: "UnexpectedEOF readHeader (1)"
          };
        }
        var b1 = buf[0] >>> 0;
        var b2 = buf[1] >>> 0;
        var b3 = buf[2] >>> 0;
        var b4 = buf[3] >>> 0;
        var fh = Frameheader.createNew((b1 << 24 >>> 0 | b2 << 16 >>> 0 | b3 << 8 >>> 0 | b4 << 0 >>> 0) >>> 0);
        while (!fh.isValid()) {
          result = source.readFull(1);
          if (result.err) {
            return {
              err: result.err
            };
          }
          buf = result.buf;
          if (buf.byteLength !== 1) {
            return {
              h: 0,
              position: 0,
              err: "UnexpectedEOF readHeader (2)"
            };
          }
          b1 = b2;
          b2 = b3;
          b3 = b4;
          b4 = buf[0] >>> 0;
          fh = Frameheader.createNew((b1 << 24 >>> 0 | b2 << 16 >>> 0 | b3 << 8 >>> 0 | b4 << 0 >>> 0) >>> 0);
          pos++;
        }
        if (fh.bitrateIndex() === 0) {
          return {
            h: 0,
            position: 0,
            err: "mp3: free bitrate format is not supported. Header word is " + fh.value + " at position " + position
          };
        }
        return {
          h: fh,
          position: pos
        };
      }
    };
    module2.exports = Frameheader;
  }
});

// node_modules/js-mp3/src/imdct.js
var require_imdct = __commonJS({
  "node_modules/js-mp3/src/imdct.js"(exports2, module2) {
    init_globals();
    var imdctWinData = [new Float32Array(36), new Float32Array(36), new Float32Array(36), new Float32Array(36)];
    var cosN12 = [];
    for (i = 0; i < 6; i++) {
      cosN12.push(new Float32Array(12));
    }
    var i;
    var cosN36 = [];
    for (i = 0; i < 18; i++) {
      cosN36.push(new Float32Array(36));
    }
    var i;
    var init = function() {
      for (var i2 = 0; i2 < 36; i2++) {
        imdctWinData[0][i2] = Math.sin(Math.PI / 36 * (i2 + 0.5));
      }
      for (var i2 = 0; i2 < 18; i2++) {
        imdctWinData[1][i2] = Math.sin(Math.PI / 36 * (i2 + 0.5));
      }
      for (var i2 = 18; i2 < 24; i2++) {
        imdctWinData[1][i2] = 1;
      }
      for (var i2 = 24; i2 < 30; i2++) {
        imdctWinData[1][i2] = Math.sin(Math.PI / 12 * (i2 + 0.5 - 18));
      }
      for (var i2 = 30; i2 < 36; i2++) {
        imdctWinData[1][i2] = 0;
      }
      for (var i2 = 0; i2 < 12; i2++) {
        imdctWinData[2][i2] = Math.sin(Math.PI / 12 * (i2 + 0.5));
      }
      for (var i2 = 12; i2 < 36; i2++) {
        imdctWinData[2][i2] = 0;
      }
      for (var i2 = 0; i2 < 6; i2++) {
        imdctWinData[3][i2] = 0;
      }
      for (var i2 = 6; i2 < 12; i2++) {
        imdctWinData[3][i2] = Math.sin(Math.PI / 12 * (i2 + 0.5 - 6));
      }
      for (var i2 = 12; i2 < 18; i2++) {
        imdctWinData[3][i2] = 1;
      }
      for (var i2 = 18; i2 < 36; i2++) {
        imdctWinData[3][i2] = Math.sin(Math.PI / 36 * (i2 + 0.5));
      }
      const cosN12_N = 12;
      for (var i2 = 0; i2 < 6; i2++) {
        for (var j = 0; j < 12; j++) {
          cosN12[i2][j] = Math.cos(Math.PI / (2 * cosN12_N) * (2 * j + 1 + cosN12_N / 2) * (2 * i2 + 1));
        }
      }
      const cosN36_N = 36;
      for (var i2 = 0; i2 < 18; i2++) {
        for (var j = 0; j < 36; j++) {
          cosN36[i2][j] = Math.cos(Math.PI / (2 * cosN36_N) * (2 * j + 1 + cosN36_N / 2) * (2 * i2 + 1));
        }
      }
    };
    init();
    var Imdct = {
      Win: function(inData, blockType) {
        var out = new Float32Array(36);
        if (blockType === 2) {
          var iwd = imdctWinData[blockType];
          const N2 = 12;
          for (var i2 = 0; i2 < 3; i2++) {
            for (var p = 0; p < N2; p++) {
              var sum = 0;
              for (var m = 0; m < N2 / 2; m++) {
                sum += inData[i2 + 3 * m] * cosN12[m][p];
              }
              out[6 * i2 + p + 6] += sum * iwd[p];
            }
          }
          return out;
        }
        const N = 36;
        var iwd = imdctWinData[blockType];
        for (var p = 0; p < N; p++) {
          var sum = 0;
          for (var m = 0; m < N / 2; m++) {
            sum += inData[m] * cosN36[m][p];
          }
          out[p] = sum * iwd[p];
        }
        return out;
      }
    };
    module2.exports = Imdct;
  }
});

// node_modules/js-mp3/src/huffman.js
var require_huffman = __commonJS({
  "node_modules/js-mp3/src/huffman.js"(exports2, module2) {
    init_globals();
    var huffmanTable = new Uint16Array([
      // 1
      513,
      0,
      513,
      16,
      513,
      1,
      17,
      // 2
      513,
      0,
      1025,
      513,
      16,
      1,
      513,
      17,
      1025,
      513,
      32,
      33,
      513,
      18,
      513,
      2,
      34,
      // 3
      1025,
      513,
      0,
      1,
      513,
      17,
      513,
      16,
      1025,
      513,
      32,
      33,
      513,
      18,
      513,
      2,
      34,
      // 5
      513,
      0,
      1025,
      513,
      16,
      1,
      513,
      17,
      2049,
      1025,
      513,
      32,
      2,
      513,
      33,
      18,
      2049,
      1025,
      513,
      34,
      48,
      513,
      3,
      19,
      513,
      49,
      513,
      50,
      513,
      35,
      51,
      // 6
      1537,
      1025,
      513,
      0,
      16,
      17,
      1537,
      513,
      1,
      513,
      32,
      33,
      1537,
      513,
      18,
      513,
      2,
      34,
      1025,
      513,
      49,
      19,
      1025,
      513,
      48,
      50,
      513,
      35,
      513,
      3,
      51,
      // 7
      513,
      0,
      1025,
      513,
      16,
      1,
      2049,
      513,
      17,
      1025,
      513,
      32,
      2,
      33,
      4609,
      1537,
      513,
      18,
      513,
      34,
      48,
      1025,
      513,
      49,
      19,
      1025,
      513,
      3,
      50,
      513,
      35,
      4,
      2561,
      1025,
      513,
      64,
      65,
      513,
      20,
      513,
      66,
      36,
      3073,
      1537,
      1025,
      513,
      51,
      67,
      80,
      1025,
      513,
      52,
      5,
      81,
      1537,
      513,
      21,
      513,
      82,
      37,
      1025,
      513,
      68,
      53,
      1025,
      513,
      83,
      84,
      513,
      69,
      85,
      // 8
      1537,
      513,
      0,
      513,
      16,
      1,
      513,
      17,
      1025,
      513,
      33,
      18,
      3585,
      1025,
      513,
      32,
      2,
      513,
      34,
      1025,
      513,
      48,
      3,
      513,
      49,
      19,
      3585,
      2049,
      1025,
      513,
      50,
      35,
      513,
      64,
      4,
      513,
      65,
      513,
      20,
      66,
      3073,
      1537,
      513,
      36,
      513,
      51,
      80,
      1025,
      513,
      67,
      52,
      81,
      1537,
      513,
      21,
      513,
      5,
      82,
      1537,
      513,
      37,
      513,
      68,
      53,
      513,
      83,
      513,
      69,
      513,
      84,
      85,
      // 9
      2049,
      1025,
      513,
      0,
      16,
      513,
      1,
      17,
      2561,
      1025,
      513,
      32,
      33,
      513,
      18,
      513,
      2,
      34,
      3073,
      1537,
      1025,
      513,
      48,
      3,
      49,
      513,
      19,
      513,
      50,
      35,
      3073,
      1025,
      513,
      65,
      20,
      1025,
      513,
      64,
      51,
      513,
      66,
      36,
      2561,
      1537,
      1025,
      513,
      4,
      80,
      67,
      513,
      52,
      81,
      2049,
      1025,
      513,
      21,
      82,
      513,
      37,
      68,
      1537,
      1025,
      513,
      5,
      84,
      83,
      513,
      53,
      513,
      69,
      85,
      // 10
      513,
      0,
      1025,
      513,
      16,
      1,
      2561,
      513,
      17,
      1025,
      513,
      32,
      2,
      513,
      33,
      18,
      7169,
      2049,
      1025,
      513,
      34,
      48,
      513,
      49,
      19,
      2049,
      1025,
      513,
      3,
      50,
      513,
      35,
      64,
      1025,
      513,
      65,
      20,
      1025,
      513,
      4,
      51,
      513,
      66,
      36,
      7169,
      2561,
      1537,
      1025,
      513,
      80,
      5,
      96,
      513,
      97,
      22,
      3073,
      1537,
      1025,
      513,
      67,
      52,
      81,
      513,
      21,
      513,
      82,
      37,
      1025,
      513,
      38,
      54,
      113,
      5121,
      2049,
      513,
      23,
      1025,
      513,
      68,
      83,
      6,
      1537,
      1025,
      513,
      53,
      69,
      98,
      513,
      112,
      513,
      7,
      100,
      3585,
      1025,
      513,
      114,
      39,
      1537,
      513,
      99,
      513,
      84,
      85,
      513,
      70,
      115,
      2049,
      1025,
      513,
      55,
      101,
      513,
      86,
      116,
      1537,
      513,
      71,
      513,
      102,
      117,
      1025,
      513,
      87,
      118,
      513,
      103,
      119,
      // 11
      1537,
      513,
      0,
      513,
      16,
      1,
      2049,
      513,
      17,
      1025,
      513,
      32,
      2,
      18,
      6145,
      2049,
      513,
      33,
      513,
      34,
      513,
      48,
      3,
      1025,
      513,
      49,
      19,
      1025,
      513,
      50,
      35,
      1025,
      513,
      64,
      4,
      513,
      65,
      20,
      7681,
      4097,
      2561,
      1025,
      513,
      66,
      36,
      1025,
      513,
      51,
      67,
      80,
      1025,
      513,
      52,
      81,
      97,
      1537,
      513,
      22,
      513,
      6,
      38,
      513,
      98,
      513,
      21,
      513,
      5,
      82,
      4097,
      2561,
      1537,
      1025,
      513,
      37,
      68,
      96,
      513,
      99,
      54,
      1025,
      513,
      112,
      23,
      113,
      4097,
      1537,
      1025,
      513,
      7,
      100,
      114,
      513,
      39,
      1025,
      513,
      83,
      53,
      513,
      84,
      69,
      2561,
      1025,
      513,
      70,
      115,
      513,
      55,
      513,
      101,
      86,
      2561,
      1537,
      1025,
      513,
      85,
      87,
      116,
      513,
      71,
      102,
      1025,
      513,
      117,
      118,
      513,
      103,
      119,
      // 12
      3073,
      1025,
      513,
      16,
      1,
      513,
      17,
      513,
      0,
      513,
      32,
      2,
      4097,
      1025,
      513,
      33,
      18,
      1025,
      513,
      34,
      49,
      513,
      19,
      513,
      48,
      513,
      3,
      64,
      6657,
      2049,
      1025,
      513,
      50,
      35,
      513,
      65,
      51,
      2561,
      1025,
      513,
      20,
      66,
      513,
      36,
      513,
      4,
      80,
      1025,
      513,
      67,
      52,
      513,
      81,
      21,
      7169,
      3585,
      2049,
      1025,
      513,
      82,
      37,
      513,
      83,
      53,
      1025,
      513,
      96,
      22,
      97,
      1025,
      513,
      98,
      38,
      1537,
      1025,
      513,
      5,
      6,
      68,
      513,
      84,
      69,
      4609,
      2561,
      1025,
      513,
      99,
      54,
      1025,
      513,
      112,
      7,
      113,
      1025,
      513,
      23,
      100,
      513,
      70,
      114,
      2561,
      1537,
      513,
      39,
      513,
      85,
      115,
      513,
      55,
      86,
      2049,
      1025,
      513,
      101,
      116,
      513,
      71,
      102,
      1025,
      513,
      117,
      87,
      513,
      118,
      513,
      103,
      119,
      // 13
      513,
      0,
      1537,
      513,
      16,
      513,
      1,
      17,
      7169,
      2049,
      1025,
      513,
      32,
      2,
      513,
      33,
      18,
      2049,
      1025,
      513,
      34,
      48,
      513,
      3,
      49,
      1537,
      513,
      19,
      513,
      50,
      35,
      1025,
      513,
      64,
      4,
      65,
      17921,
      7169,
      3585,
      1537,
      513,
      20,
      513,
      51,
      66,
      1025,
      513,
      36,
      80,
      513,
      67,
      52,
      1025,
      513,
      81,
      21,
      1025,
      513,
      5,
      82,
      513,
      37,
      513,
      68,
      83,
      3585,
      2049,
      1025,
      513,
      96,
      6,
      513,
      97,
      22,
      1025,
      513,
      128,
      8,
      129,
      4097,
      2049,
      1025,
      513,
      53,
      98,
      513,
      38,
      84,
      1025,
      513,
      69,
      99,
      513,
      54,
      112,
      1537,
      1025,
      513,
      7,
      85,
      113,
      513,
      23,
      513,
      39,
      55,
      18433,
      6145,
      3073,
      1025,
      513,
      24,
      130,
      513,
      40,
      1025,
      513,
      100,
      70,
      114,
      2049,
      1025,
      513,
      132,
      72,
      513,
      144,
      9,
      513,
      145,
      25,
      6145,
      3585,
      2049,
      1025,
      513,
      115,
      101,
      513,
      86,
      116,
      1025,
      513,
      71,
      102,
      131,
      1537,
      513,
      56,
      513,
      117,
      87,
      513,
      146,
      41,
      3585,
      2049,
      1025,
      513,
      103,
      133,
      513,
      88,
      57,
      513,
      147,
      513,
      73,
      134,
      1537,
      513,
      160,
      513,
      104,
      10,
      513,
      161,
      26,
      17409,
      6145,
      3073,
      1025,
      513,
      162,
      42,
      1025,
      513,
      149,
      89,
      513,
      163,
      58,
      2049,
      1025,
      513,
      74,
      150,
      513,
      176,
      11,
      513,
      177,
      27,
      5121,
      2049,
      513,
      178,
      1025,
      513,
      118,
      119,
      148,
      1537,
      1025,
      513,
      135,
      120,
      164,
      1025,
      513,
      105,
      165,
      43,
      3073,
      1537,
      1025,
      513,
      90,
      136,
      179,
      513,
      59,
      513,
      121,
      166,
      1537,
      1025,
      513,
      106,
      180,
      192,
      1025,
      513,
      12,
      152,
      193,
      15361,
      5633,
      2561,
      1537,
      513,
      28,
      513,
      137,
      181,
      513,
      91,
      194,
      1025,
      513,
      44,
      60,
      1025,
      513,
      182,
      107,
      513,
      196,
      76,
      4097,
      2049,
      1025,
      513,
      168,
      138,
      513,
      208,
      13,
      513,
      209,
      513,
      75,
      513,
      151,
      167,
      3073,
      1537,
      513,
      195,
      513,
      122,
      153,
      1025,
      513,
      197,
      92,
      183,
      1025,
      513,
      29,
      210,
      513,
      45,
      513,
      123,
      211,
      13313,
      7169,
      3073,
      1025,
      513,
      61,
      198,
      1025,
      513,
      108,
      169,
      513,
      154,
      212,
      2049,
      1025,
      513,
      184,
      139,
      513,
      77,
      199,
      1025,
      513,
      124,
      213,
      513,
      93,
      224,
      2561,
      1025,
      513,
      225,
      30,
      1025,
      513,
      14,
      46,
      226,
      2049,
      1025,
      513,
      227,
      109,
      513,
      140,
      228,
      1025,
      513,
      229,
      186,
      240,
      9729,
      4097,
      1025,
      513,
      241,
      31,
      1537,
      1025,
      513,
      170,
      155,
      185,
      513,
      62,
      513,
      214,
      200,
      3073,
      1537,
      513,
      78,
      513,
      215,
      125,
      513,
      171,
      513,
      94,
      201,
      1537,
      513,
      15,
      513,
      156,
      110,
      513,
      242,
      47,
      8193,
      4097,
      1537,
      1025,
      513,
      216,
      141,
      63,
      1537,
      513,
      243,
      513,
      230,
      202,
      513,
      244,
      79,
      2049,
      1025,
      513,
      187,
      172,
      513,
      231,
      245,
      1025,
      513,
      217,
      157,
      513,
      95,
      232,
      7681,
      3073,
      1537,
      513,
      111,
      513,
      246,
      203,
      1025,
      513,
      188,
      173,
      218,
      2049,
      513,
      247,
      1025,
      513,
      126,
      127,
      142,
      1537,
      1025,
      513,
      158,
      174,
      204,
      513,
      248,
      143,
      4609,
      2049,
      1025,
      513,
      219,
      189,
      513,
      234,
      249,
      1025,
      513,
      159,
      235,
      513,
      190,
      513,
      205,
      250,
      3585,
      1025,
      513,
      221,
      236,
      1537,
      1025,
      513,
      233,
      175,
      220,
      513,
      206,
      251,
      2049,
      1025,
      513,
      191,
      222,
      513,
      207,
      238,
      1025,
      513,
      223,
      239,
      513,
      255,
      513,
      237,
      513,
      253,
      513,
      252,
      254,
      // 15
      4097,
      1537,
      513,
      0,
      513,
      16,
      1,
      513,
      17,
      1025,
      513,
      32,
      2,
      513,
      33,
      18,
      12801,
      4097,
      1537,
      513,
      34,
      513,
      48,
      49,
      1537,
      513,
      19,
      513,
      3,
      64,
      513,
      50,
      35,
      3585,
      1537,
      1025,
      513,
      4,
      20,
      65,
      1025,
      513,
      51,
      66,
      513,
      36,
      67,
      2561,
      1537,
      513,
      52,
      513,
      80,
      5,
      513,
      81,
      21,
      1025,
      513,
      82,
      37,
      1025,
      513,
      68,
      83,
      97,
      23041,
      9217,
      4609,
      2561,
      1537,
      513,
      53,
      513,
      96,
      6,
      513,
      22,
      98,
      1025,
      513,
      38,
      84,
      513,
      69,
      99,
      2561,
      1537,
      513,
      54,
      513,
      112,
      7,
      513,
      113,
      85,
      1025,
      513,
      23,
      100,
      513,
      114,
      39,
      6145,
      4097,
      2049,
      1025,
      513,
      70,
      115,
      513,
      55,
      101,
      1025,
      513,
      86,
      128,
      513,
      8,
      116,
      1025,
      513,
      129,
      24,
      513,
      130,
      40,
      4097,
      2049,
      1025,
      513,
      71,
      102,
      513,
      131,
      56,
      1025,
      513,
      117,
      87,
      513,
      132,
      72,
      1537,
      1025,
      513,
      144,
      25,
      145,
      1025,
      513,
      146,
      118,
      513,
      103,
      41,
      23553,
      9217,
      4609,
      2561,
      1025,
      513,
      133,
      88,
      1025,
      513,
      9,
      119,
      147,
      1025,
      513,
      57,
      148,
      513,
      73,
      134,
      2561,
      1537,
      513,
      104,
      513,
      160,
      10,
      513,
      161,
      26,
      1025,
      513,
      162,
      42,
      513,
      149,
      89,
      6657,
      3585,
      1537,
      513,
      163,
      513,
      58,
      135,
      1025,
      513,
      120,
      164,
      513,
      74,
      150,
      1537,
      1025,
      513,
      105,
      176,
      177,
      1025,
      513,
      27,
      165,
      178,
      3585,
      2049,
      1025,
      513,
      90,
      43,
      513,
      136,
      151,
      513,
      179,
      513,
      121,
      59,
      2049,
      1025,
      513,
      106,
      180,
      513,
      75,
      193,
      1025,
      513,
      152,
      137,
      513,
      28,
      181,
      20481,
      8705,
      4097,
      1537,
      1025,
      513,
      91,
      44,
      194,
      1537,
      1025,
      513,
      11,
      192,
      166,
      513,
      167,
      122,
      2561,
      1025,
      513,
      195,
      60,
      1025,
      513,
      12,
      153,
      182,
      1025,
      513,
      107,
      196,
      513,
      76,
      168,
      5121,
      2561,
      1025,
      513,
      138,
      197,
      1025,
      513,
      208,
      92,
      209,
      1025,
      513,
      183,
      123,
      513,
      29,
      513,
      13,
      45,
      3073,
      1025,
      513,
      210,
      211,
      1025,
      513,
      61,
      198,
      513,
      108,
      169,
      1537,
      1025,
      513,
      154,
      184,
      212,
      1025,
      513,
      139,
      77,
      513,
      199,
      124,
      17409,
      8705,
      4609,
      2561,
      1025,
      513,
      213,
      93,
      1025,
      513,
      224,
      14,
      225,
      1025,
      513,
      30,
      226,
      513,
      170,
      46,
      2049,
      1025,
      513,
      185,
      155,
      513,
      227,
      214,
      1025,
      513,
      109,
      62,
      513,
      200,
      140,
      4097,
      2049,
      1025,
      513,
      228,
      78,
      513,
      215,
      125,
      1025,
      513,
      229,
      186,
      513,
      171,
      94,
      2049,
      1025,
      513,
      201,
      156,
      513,
      241,
      31,
      1537,
      1025,
      513,
      240,
      110,
      242,
      513,
      47,
      230,
      9729,
      4609,
      2049,
      1025,
      513,
      216,
      243,
      513,
      63,
      244,
      1537,
      513,
      79,
      513,
      141,
      217,
      513,
      187,
      202,
      2049,
      1025,
      513,
      172,
      231,
      513,
      126,
      245,
      2049,
      1025,
      513,
      157,
      95,
      513,
      232,
      142,
      513,
      246,
      203,
      8705,
      4609,
      2561,
      1537,
      1025,
      513,
      15,
      174,
      111,
      513,
      188,
      218,
      1025,
      513,
      173,
      247,
      513,
      127,
      233,
      2049,
      1025,
      513,
      158,
      204,
      513,
      248,
      143,
      1025,
      513,
      219,
      189,
      513,
      234,
      249,
      4097,
      2049,
      1025,
      513,
      159,
      220,
      513,
      205,
      235,
      1025,
      513,
      190,
      250,
      513,
      175,
      221,
      3585,
      1537,
      1025,
      513,
      236,
      206,
      251,
      1025,
      513,
      191,
      237,
      513,
      222,
      252,
      1537,
      1025,
      513,
      207,
      253,
      238,
      1025,
      513,
      223,
      254,
      513,
      239,
      255,
      // 16
      513,
      0,
      1537,
      513,
      16,
      513,
      1,
      17,
      10753,
      2049,
      1025,
      513,
      32,
      2,
      513,
      33,
      18,
      2561,
      1537,
      513,
      34,
      513,
      48,
      3,
      513,
      49,
      19,
      2561,
      1025,
      513,
      50,
      35,
      1025,
      513,
      64,
      4,
      65,
      1537,
      513,
      20,
      513,
      51,
      66,
      1025,
      513,
      36,
      80,
      513,
      67,
      52,
      35329,
      10241,
      4097,
      1537,
      1025,
      513,
      5,
      21,
      81,
      1025,
      513,
      82,
      37,
      1025,
      513,
      68,
      53,
      83,
      2561,
      1537,
      1025,
      513,
      96,
      6,
      97,
      513,
      22,
      98,
      2049,
      1025,
      513,
      38,
      84,
      513,
      69,
      99,
      1025,
      513,
      54,
      112,
      113,
      10241,
      4609,
      2049,
      513,
      23,
      513,
      7,
      513,
      85,
      100,
      1025,
      513,
      114,
      39,
      1025,
      513,
      70,
      101,
      115,
      2561,
      1537,
      513,
      55,
      513,
      86,
      8,
      513,
      128,
      129,
      1537,
      513,
      24,
      513,
      116,
      71,
      513,
      130,
      513,
      40,
      102,
      6145,
      3585,
      2049,
      1025,
      513,
      131,
      56,
      513,
      117,
      132,
      1025,
      513,
      72,
      144,
      145,
      1537,
      513,
      25,
      513,
      9,
      118,
      513,
      146,
      41,
      3585,
      2049,
      1025,
      513,
      133,
      88,
      513,
      147,
      57,
      1025,
      513,
      160,
      10,
      26,
      2049,
      513,
      162,
      513,
      103,
      513,
      87,
      73,
      1537,
      513,
      148,
      513,
      119,
      134,
      513,
      161,
      513,
      104,
      149,
      56321,
      32257,
      12801,
      6657,
      3073,
      1537,
      513,
      42,
      513,
      89,
      58,
      513,
      163,
      513,
      135,
      120,
      2049,
      1025,
      513,
      164,
      74,
      513,
      150,
      105,
      1025,
      513,
      176,
      11,
      177,
      2561,
      1025,
      513,
      27,
      178,
      513,
      43,
      513,
      165,
      90,
      1537,
      513,
      179,
      513,
      166,
      106,
      1025,
      513,
      180,
      75,
      513,
      12,
      193,
      7681,
      3585,
      1537,
      1025,
      513,
      181,
      194,
      44,
      1025,
      513,
      167,
      195,
      513,
      107,
      196,
      2049,
      513,
      29,
      1025,
      513,
      136,
      151,
      59,
      1025,
      513,
      209,
      210,
      513,
      45,
      211,
      4609,
      1537,
      1025,
      513,
      30,
      46,
      226,
      1537,
      1025,
      513,
      121,
      152,
      192,
      513,
      28,
      513,
      137,
      91,
      3585,
      1537,
      513,
      60,
      513,
      122,
      182,
      1025,
      513,
      76,
      153,
      513,
      168,
      138,
      1537,
      513,
      13,
      513,
      197,
      92,
      1025,
      513,
      61,
      198,
      513,
      108,
      154,
      22529,
      22017,
      9217,
      4097,
      2049,
      1025,
      513,
      139,
      77,
      513,
      199,
      124,
      1025,
      513,
      213,
      93,
      513,
      224,
      14,
      2049,
      513,
      227,
      1025,
      513,
      208,
      183,
      123,
      1537,
      1025,
      513,
      169,
      184,
      212,
      513,
      225,
      513,
      170,
      185,
      6145,
      2561,
      1537,
      1025,
      513,
      155,
      214,
      109,
      513,
      62,
      200,
      1537,
      1025,
      513,
      140,
      228,
      78,
      1025,
      513,
      215,
      229,
      513,
      186,
      171,
      3073,
      1025,
      513,
      156,
      230,
      1025,
      513,
      110,
      216,
      513,
      141,
      187,
      2049,
      1025,
      513,
      231,
      157,
      513,
      232,
      142,
      1025,
      513,
      203,
      188,
      158,
      241,
      513,
      31,
      513,
      15,
      47,
      16897,
      14337,
      513,
      242,
      13313,
      12801,
      5121,
      2049,
      513,
      189,
      513,
      94,
      513,
      125,
      201,
      1537,
      513,
      202,
      513,
      172,
      126,
      1025,
      513,
      218,
      173,
      204,
      2561,
      1537,
      513,
      174,
      513,
      219,
      220,
      513,
      205,
      190,
      1537,
      1025,
      513,
      235,
      237,
      238,
      1537,
      1025,
      513,
      217,
      234,
      233,
      513,
      222,
      1025,
      513,
      221,
      236,
      206,
      63,
      240,
      1025,
      513,
      243,
      244,
      513,
      79,
      513,
      245,
      95,
      2561,
      513,
      255,
      1025,
      513,
      246,
      111,
      513,
      247,
      127,
      3073,
      1537,
      513,
      143,
      513,
      248,
      249,
      1025,
      513,
      159,
      250,
      175,
      2049,
      1025,
      513,
      251,
      191,
      513,
      252,
      207,
      1025,
      513,
      253,
      223,
      513,
      254,
      239,
      // 24
      15361,
      2049,
      1025,
      513,
      0,
      16,
      513,
      1,
      17,
      3585,
      1537,
      1025,
      513,
      32,
      2,
      33,
      513,
      18,
      513,
      34,
      513,
      48,
      3,
      3585,
      1025,
      513,
      49,
      19,
      1025,
      513,
      50,
      35,
      1025,
      513,
      64,
      4,
      65,
      2049,
      1025,
      513,
      20,
      51,
      513,
      66,
      36,
      1537,
      1025,
      513,
      67,
      52,
      81,
      1537,
      1025,
      513,
      80,
      5,
      21,
      513,
      82,
      37,
      64001,
      25089,
      8705,
      4609,
      2561,
      1025,
      513,
      68,
      83,
      513,
      53,
      513,
      96,
      6,
      1025,
      513,
      97,
      22,
      513,
      98,
      38,
      2049,
      1025,
      513,
      84,
      69,
      513,
      99,
      54,
      1025,
      513,
      113,
      85,
      513,
      100,
      70,
      8193,
      3585,
      1537,
      513,
      114,
      513,
      39,
      55,
      513,
      115,
      1025,
      513,
      112,
      7,
      23,
      2561,
      1025,
      513,
      101,
      86,
      1025,
      513,
      128,
      8,
      129,
      1025,
      513,
      116,
      71,
      513,
      24,
      130,
      4097,
      2049,
      1025,
      513,
      40,
      102,
      513,
      131,
      56,
      1025,
      513,
      117,
      87,
      513,
      132,
      72,
      2049,
      1025,
      513,
      145,
      25,
      513,
      146,
      118,
      1025,
      513,
      103,
      41,
      513,
      133,
      88,
      23553,
      8705,
      4097,
      2049,
      1025,
      513,
      147,
      57,
      513,
      148,
      73,
      1025,
      513,
      119,
      134,
      513,
      104,
      161,
      2049,
      1025,
      513,
      162,
      42,
      513,
      149,
      89,
      1025,
      513,
      163,
      58,
      513,
      135,
      513,
      120,
      74,
      5633,
      3073,
      1025,
      513,
      164,
      150,
      1025,
      513,
      105,
      177,
      513,
      27,
      165,
      1537,
      513,
      178,
      513,
      90,
      43,
      513,
      136,
      179,
      4097,
      2561,
      1537,
      513,
      144,
      513,
      9,
      160,
      513,
      151,
      121,
      1025,
      513,
      166,
      106,
      180,
      3073,
      1537,
      513,
      26,
      513,
      10,
      176,
      513,
      59,
      513,
      11,
      192,
      1025,
      513,
      75,
      193,
      513,
      152,
      137,
      17153,
      8705,
      4097,
      2049,
      1025,
      513,
      28,
      181,
      513,
      91,
      194,
      1025,
      513,
      44,
      167,
      513,
      122,
      195,
      2561,
      1537,
      513,
      60,
      513,
      12,
      208,
      513,
      182,
      107,
      1025,
      513,
      196,
      76,
      513,
      153,
      168,
      4097,
      2049,
      1025,
      513,
      138,
      197,
      513,
      92,
      209,
      1025,
      513,
      183,
      123,
      513,
      29,
      210,
      2305,
      1025,
      513,
      45,
      211,
      513,
      61,
      198,
      22010,
      1025,
      513,
      108,
      169,
      513,
      154,
      212,
      8193,
      4097,
      2049,
      1025,
      513,
      184,
      139,
      513,
      77,
      199,
      1025,
      513,
      124,
      213,
      513,
      93,
      225,
      2049,
      1025,
      513,
      30,
      226,
      513,
      170,
      185,
      1025,
      513,
      155,
      227,
      513,
      214,
      109,
      5121,
      2561,
      1537,
      513,
      62,
      513,
      46,
      78,
      513,
      200,
      140,
      1025,
      513,
      228,
      215,
      1025,
      513,
      125,
      171,
      229,
      2561,
      1025,
      513,
      186,
      94,
      513,
      201,
      513,
      156,
      110,
      2049,
      513,
      230,
      513,
      13,
      513,
      224,
      14,
      1025,
      513,
      216,
      141,
      513,
      187,
      202,
      18945,
      513,
      255,
      16385,
      14849,
      8193,
      4097,
      2049,
      1025,
      513,
      172,
      231,
      513,
      126,
      217,
      1025,
      513,
      157,
      232,
      513,
      142,
      203,
      2049,
      1025,
      513,
      188,
      218,
      513,
      173,
      233,
      1025,
      513,
      158,
      204,
      513,
      219,
      189,
      4097,
      2049,
      1025,
      513,
      234,
      174,
      513,
      220,
      205,
      1025,
      513,
      235,
      190,
      513,
      221,
      236,
      2049,
      1025,
      513,
      206,
      237,
      513,
      222,
      238,
      15,
      1025,
      513,
      240,
      31,
      241,
      1025,
      513,
      242,
      47,
      513,
      243,
      63,
      4609,
      2049,
      1025,
      513,
      244,
      79,
      513,
      245,
      95,
      1025,
      513,
      246,
      111,
      513,
      247,
      513,
      127,
      143,
      2561,
      1025,
      513,
      248,
      249,
      1025,
      513,
      159,
      175,
      250,
      2049,
      1025,
      513,
      251,
      191,
      513,
      252,
      207,
      1025,
      513,
      253,
      223,
      513,
      254,
      239,
      // 32
      513,
      0,
      2049,
      1025,
      513,
      8,
      4,
      513,
      1,
      2,
      2049,
      1025,
      513,
      12,
      10,
      513,
      3,
      6,
      1537,
      513,
      9,
      513,
      5,
      7,
      1025,
      513,
      14,
      13,
      513,
      15,
      11,
      // 33
      4097,
      2049,
      1025,
      513,
      0,
      1,
      513,
      2,
      3,
      1025,
      513,
      4,
      5,
      513,
      6,
      7,
      2049,
      1025,
      513,
      8,
      9,
      513,
      10,
      11,
      1025,
      513,
      12,
      13,
      513,
      14,
      15
    ]);
    var huffmanMain = [
      { hufftable: null, linbits: 0 },
      // Table  0
      { hufftable: huffmanTable.subarray(0, 7), linbits: 0 },
      // Table  1
      { hufftable: huffmanTable.subarray(7, 7 + 17), linbits: 0 },
      // Table  2
      { hufftable: huffmanTable.subarray(24, 24 + 17), linbits: 0 },
      // Table  3
      { hufftable: null, linbits: 0 },
      // Table  4
      { hufftable: huffmanTable.subarray(41, 41 + 31), linbits: 0 },
      // Table  5
      { hufftable: huffmanTable.subarray(72, 72 + 31), linbits: 0 },
      // Table  6
      { hufftable: huffmanTable.subarray(103, 103 + 71), linbits: 0 },
      // Table  7
      { hufftable: huffmanTable.subarray(174, 174 + 71), linbits: 0 },
      // Table  8
      { hufftable: huffmanTable.subarray(245, 245 + 71), linbits: 0 },
      // Table  9
      { hufftable: huffmanTable.subarray(316, 316 + 127), linbits: 0 },
      // Table  10
      { hufftable: huffmanTable.subarray(443, 443 + 127), linbits: 0 },
      // Table  11
      { hufftable: huffmanTable.subarray(570, 570 + 127), linbits: 0 },
      // Table  12
      { hufftable: huffmanTable.subarray(697, 697 + 511), linbits: 0 },
      // Table  13
      { hufftable: null, linbits: 0 },
      // Table  14
      { hufftable: huffmanTable.subarray(1208, 1208 + 511), linbits: 0 },
      // Table  15
      { hufftable: huffmanTable.subarray(1719, 1719 + 511), linbits: 1 },
      // Table  16
      { hufftable: huffmanTable.subarray(1719, 1719 + 511), linbits: 2 },
      // Table  17
      { hufftable: huffmanTable.subarray(1719, 1719 + 511), linbits: 3 },
      // Table  18
      { hufftable: huffmanTable.subarray(1719, 1719 + 511), linbits: 4 },
      // Table  19
      { hufftable: huffmanTable.subarray(1719, 1719 + 511), linbits: 6 },
      // Table  20
      { hufftable: huffmanTable.subarray(1719, 1719 + 511), linbits: 8 },
      // Table  21
      { hufftable: huffmanTable.subarray(1719, 1719 + 511), linbits: 10 },
      // Table  22
      { hufftable: huffmanTable.subarray(1719, 1719 + 511), linbits: 13 },
      // Table  23
      { hufftable: huffmanTable.subarray(2230, 2230 + 512), linbits: 4 },
      // Table  24
      { hufftable: huffmanTable.subarray(2230, 2230 + 512), linbits: 5 },
      // Table  25
      { hufftable: huffmanTable.subarray(2230, 2230 + 512), linbits: 6 },
      // Table  26
      { hufftable: huffmanTable.subarray(2230, 2230 + 512), linbits: 7 },
      // Table  27
      { hufftable: huffmanTable.subarray(2230, 2230 + 512), linbits: 8 },
      // Table  28
      { hufftable: huffmanTable.subarray(2230, 2230 + 512), linbits: 9 },
      // Table  29
      { hufftable: huffmanTable.subarray(2230, 2230 + 512), linbits: 11 },
      // Table  30
      { hufftable: huffmanTable.subarray(2230, 2230 + 512), linbits: 13 },
      // Table  31
      { hufftable: huffmanTable.subarray(2742, 2742 + 31), linbits: 0 },
      // Table  32
      { hufftable: huffmanTable.subarray(2773, 2773 + 31), linbits: 0 }
      // Table  33
    ];
    function decode(m, tableNum) {
      var x = 0, y = 0, v = 0, w = 0;
      var point = 0;
      var error = 1;
      var bitsleft = 32;
      var hufftable = huffmanMain[tableNum].hufftable;
      var linbits = huffmanMain[tableNum].linbits;
      if (null === hufftable) {
        return {
          x: 0,
          y: 0,
          v: 0,
          w: 0,
          err: null
        };
      }
      while (true) {
        if ((hufftable[point] & 65280) >>> 0 === 0) {
          error = 0;
          x = (hufftable[point] >>> 4 >>> 0 & 15) >>> 0;
          y = (hufftable[point] & 15) >>> 0;
          break;
        }
        if (m.Bit() !== 0) {
          while ((hufftable[point] & 255) >>> 0 >= 250) {
            point += (hufftable[point] & 255) >>> 0;
          }
          point += (hufftable[point] & 255) >>> 0;
        } else {
          while (hufftable[point] >>> 8 >>> 0 >= 250) {
            point += hufftable[point] >>> 8 >>> 0;
          }
          point += hufftable[point] >>> 8 >>> 0;
        }
        bitsleft--;
        if (bitsleft <= 0 || point >= hufftable.length) {
          break;
        }
      }
      if (error !== 0) {
        return {
          x: 0,
          y: 0,
          v: 0,
          w: 0,
          err: "mp3: illegal Huff code in data. bleft = " + bitsleft + ", point = " + point + ". tab = " + tableNum + "."
        };
      }
      if (tableNum > 31) {
        v = (y >>> 3 >>> 0 & 1) >>> 0;
        w = (y >>> 2 >>> 0 & 1) >>> 0;
        x = (y >>> 1 >>> 0 & 1) >>> 0;
        y = (y & 1) >>> 0;
        if (v !== 0 && m.Bit() === 1) {
          v = -v;
        }
        if (w !== 0 && m.Bit() === 1) {
          w = -w;
        }
        if (x !== 0 && m.Bit() === 1) {
          x = -x;
        }
        if (y !== 0 && m.Bit() === 1) {
          y = -y;
        }
      } else {
        if (linbits !== 0 && x === 15) {
          x += m.Bits(linbits);
        }
        if (x !== 0 && m.Bit() === 1) {
          x = -x;
        }
        if (linbits !== 0 && y === 15) {
          y += m.Bits(linbits);
        }
        if (y !== 0 && m.Bit() === 1) {
          y = -y;
        }
      }
      return {
        x,
        y,
        v,
        w,
        err: null
      };
    }
    module2.exports = {
      decode
    };
  }
});

// node_modules/js-mp3/src/bits.js
var require_bits = __commonJS({
  "node_modules/js-mp3/src/bits.js"(exports2, module2) {
    init_globals();
    var Bits = {
      createNew: function(vec) {
        var bits = {
          vec,
          // ArrayBuffer
          bitPos: 0,
          bytePos: 0
        };
        bits.Bit = function() {
          if (bits.vec.byteLength <= bits.bytePos) {
            return 0;
          }
          var dv = new DataView(bits.vec, bits.bytePos);
          var tmp = dv.getUint8(0) >>> 7 - bits.bitPos >>> 0;
          tmp &= 1;
          bits.bytePos += bits.bitPos + 1 >>> 3 >>> 0;
          bits.bitPos = bits.bitPos + 1 & 7;
          return tmp;
        };
        bits.Bits = function(num) {
          if (num === 0) {
            return 0;
          }
          if (bits.vec.byteLength <= bits.bytePos) {
            return 0;
          }
          var bb = new DataView(bits.vec, bits.bytePos);
          var tmp = (getValue(bb, 0) << 24 >>> 0 | getValue(bb, 1) << 16 >>> 0 | getValue(bb, 2) << 8 >>> 0 | getValue(bb, 3) >>> 0) >>> 0;
          tmp = tmp << bits.bitPos >>> 0;
          tmp = tmp >>> 32 - num >>> 0;
          bits.bytePos += bits.bitPos + num >>> 3 >>> 0;
          bits.bitPos = bits.bitPos + num & 7;
          return tmp;
        };
        bits.Tail = function(offset) {
          var a = new Uint8Array(bits.vec);
          return a.slice(bits.vec.byteLength - offset).buffer;
        };
        bits.LenInBytes = function() {
          return bits.vec.byteLength;
        };
        bits.BitPos = function() {
          return (bits.bytePos << 3 >>> 0) + bits.bitPos;
        };
        bits.SetPos = function(pos) {
          bits.bytePos = pos >>> 3 >>> 0;
          bits.bitPos = (pos & 7) >>> 0;
        };
        return bits;
      },
      append: function(bits, buf) {
        return Bits.createNew(bits.vec.concat(buf));
      }
    };
    var getValue = function(dv, index) {
      if (index >= dv.byteLength) {
        return 0;
      }
      return dv.getUint8(index);
    };
    module2.exports = Bits;
  }
});

// node_modules/js-mp3/src/maindata.js
var require_maindata = __commonJS({
  "node_modules/js-mp3/src/maindata.js"(exports2, module2) {
    init_globals();
    var util = require_util();
    var consts = require_consts();
    var huffman = require_huffman();
    var bits = require_bits();
    var scalefacSizes = [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [3, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 1],
      [2, 2],
      [2, 3],
      [3, 1],
      [3, 2],
      [3, 3],
      [4, 2],
      [4, 3]
    ];
    var MainData = {
      createNew: function() {
        var mainData = {};
        util.init3dArray(mainData, "ScalefacL", 2, 2, 22);
        util.init4dArray(mainData, "ScalefacS", 2, 2, 13, 3);
        util.init3dArray(mainData, "Is", 2, 2, 576);
        return mainData;
      },
      read: function(source, prev, fh, si) {
        var nch = fh.numberOfChannels();
        var framesize = fh.frameSize();
        if (framesize > 2e3) {
          return {
            v: null,
            bits: null,
            err: "mp3: framesize = " + framesize
          };
        }
        var sideinfo_size = 32;
        if (nch === 1) {
          sideinfo_size = 17;
        }
        var main_data_size = framesize - sideinfo_size - 4;
        if (fh.protectionBit() === 0) {
          main_data_size -= 2;
        }
        var result = read(source, prev, main_data_size, si.MainDataBegin);
        if (result.err) {
          return {
            v: null,
            bits: null,
            err: result.err
          };
        }
        var b = result.b;
        var md = MainData.createNew();
        for (var gr = 0; gr < 2; gr++) {
          for (var ch = 0; ch < nch; ch++) {
            var part_2_start = b.BitPos();
            var slen1 = scalefacSizes[si.ScalefacCompress[gr][ch]][0];
            var slen2 = scalefacSizes[si.ScalefacCompress[gr][ch]][1];
            if (si.WinSwitchFlag[gr][ch] === 1 && si.BlockType[gr][ch] === 2) {
              if (si.MixedBlockFlag[gr][ch] !== 0) {
                for (var sfb = 0; sfb < 8; sfb++) {
                  md.ScalefacL[gr][ch][sfb] = b.Bits(slen1);
                }
                for (var sfb = 3; sfb < 12; sfb++) {
                  var nbits = slen2;
                  if (sfb < 6) {
                    nbits = slen1;
                  }
                  for (var win = 0; win < 3; win++) {
                    md.ScalefacS[gr][ch][sfb][win] = b.Bits(nbits);
                  }
                }
              } else {
                for (var sfb = 0; sfb < 12; sfb++) {
                  var nbits = slen2;
                  if (sfb < 6) {
                    nbits = slen1;
                  }
                  for (var win = 0; win < 3; win++) {
                    md.ScalefacS[gr][ch][sfb][win] = b.Bits(nbits);
                  }
                }
              }
            } else {
              if (si.Scfsi[ch][0] === 0 || gr === 0) {
                for (var sfb = 0; sfb < 6; sfb++) {
                  md.ScalefacL[gr][ch][sfb] = b.Bits(slen1);
                }
              } else if (si.Scfsi[ch][0] === 1 && gr === 1) {
                for (var sfb = 0; sfb < 6; sfb++) {
                  md.ScalefacL[1][ch][sfb] = md.ScalefacL[0][ch][sfb];
                }
              }
              if (si.Scfsi[ch][1] === 0 || gr === 0) {
                for (var sfb = 6; sfb < 11; sfb++) {
                  md.ScalefacL[gr][ch][sfb] = b.Bits(slen1);
                }
              } else if (si.Scfsi[ch][1] === 1 && gr === 1) {
                for (var sfb = 6; sfb < 11; sfb++) {
                  md.ScalefacL[1][ch][sfb] = md.ScalefacL[0][ch][sfb];
                }
              }
              if (si.Scfsi[ch][2] === 0 || gr === 0) {
                for (var sfb = 11; sfb < 16; sfb++) {
                  md.ScalefacL[gr][ch][sfb] = b.Bits(slen2);
                }
              } else if (si.Scfsi[ch][2] === 1 && gr === 1) {
                for (var sfb = 11; sfb < 16; sfb++) {
                  md.ScalefacL[1][ch][sfb] = md.ScalefacL[0][ch][sfb];
                }
              }
              if (si.Scfsi[ch][3] === 0 || gr === 0) {
                for (var sfb = 16; sfb < 21; sfb++) {
                  md.ScalefacL[gr][ch][sfb] = b.Bits(slen2);
                }
              } else if (si.Scfsi[ch][3] === 1 && gr === 1) {
                for (var sfb = 16; sfb < 21; sfb++) {
                  md.ScalefacL[1][ch][sfb] = md.ScalefacL[0][ch][sfb];
                }
              }
            }
            var err2 = readHuffman(b, fh, si, md, part_2_start, gr, ch);
            if (err2) {
              return {
                v: null,
                bits: null,
                err: err2
              };
            }
          }
        }
        return {
          v: md,
          bits: b,
          err: null
        };
      }
    };
    var read = function(source, prev, size, offset) {
      if (size > 1500) {
        return {
          b: null,
          err: "mp3: size = " + size
        };
      }
      if (prev !== null && offset > prev.LenInBytes()) {
        var buf = new Uint8Array(source, 0, size);
        if (buf.byteLength < size) {
          return {
            b: null,
            err: "maindata.Read (1)"
          };
        }
        return {
          m: bits.append(prev, buf),
          err: null
        };
      }
      var vec;
      if (prev !== null) {
        vec = prev.Tail(offset);
      }
      var result = source.readFull(size);
      if (result.err) {
        return {
          err: result.err
        };
      }
      var buf = result.buf;
      if (buf.byteLength < size) {
        return {
          b: null,
          err: "maindata.Read (2)"
        };
      }
      return {
        b: bits.createNew(util.concatBuffers(vec, new Uint8Array(buf.slice()).buffer)),
        err: null
      };
    };
    var readHuffman = function(m, header, sideInfo, mainData, part_2_start, gr, ch) {
      if (sideInfo.Part2_3Length[gr][ch] === 0) {
        for (var i = 0; i < consts.SamplesPerGr; i++) {
          mainData.Is[gr][ch][i] = 0;
        }
        return null;
      }
      var bit_pos_end = part_2_start + sideInfo.Part2_3Length[gr][ch] - 1;
      var region_1_start = 0;
      var region_2_start = 0;
      if (sideInfo.WinSwitchFlag[gr][ch] === 1 && sideInfo.BlockType[gr][ch] === 2) {
        region_1_start = 36;
        region_2_start = consts.SamplesPerGr;
      } else {
        var sfreq = header.samplingFrequency().value;
        var l = consts.SfBandIndicesSet[sfreq].L;
        var i = sideInfo.Region0Count[gr][ch] + 1;
        if (i < 0 || util.len(l) <= i) {
          return "mp3: readHuffman failed: invalid index i: " + i;
        }
        region_1_start = l[i];
        var j = sideInfo.Region0Count[gr][ch] + sideInfo.Region1Count[gr][ch] + 2;
        if (j < 0 || util.len(l) <= j) {
          return "mp3: readHuffman failed: invalid index j: " + j;
        }
        region_2_start = l[j];
      }
      for (var is_pos = 0; is_pos < sideInfo.BigValues[gr][ch] * 2; is_pos++) {
        if (is_pos >= util.len(mainData.Is[gr][ch])) {
          return "mp3: is_pos was too big: " + is_pos;
        }
        var table_num = 0;
        if (is_pos < region_1_start) {
          table_num = sideInfo.TableSelect[gr][ch][0];
        } else if (is_pos < region_2_start) {
          table_num = sideInfo.TableSelect[gr][ch][1];
        } else {
          table_num = sideInfo.TableSelect[gr][ch][2];
        }
        var result = huffman.decode(m, table_num);
        if (result.err) {
          return err;
        }
        mainData.Is[gr][ch][is_pos] = result.x;
        is_pos++;
        mainData.Is[gr][ch][is_pos] = result.y;
      }
      var table_num = sideInfo.Count1TableSelect[gr][ch] + 32;
      var is_pos = sideInfo.BigValues[gr][ch] * 2;
      for (; is_pos <= 572 && m.BitPos() <= bit_pos_end; ) {
        var result = huffman.decode(m, table_num);
        if (result.err) {
          return err;
        }
        mainData.Is[gr][ch][is_pos] = result.v;
        is_pos++;
        if (is_pos >= consts.SamplesPerGr) {
          break;
        }
        mainData.Is[gr][ch][is_pos] = result.w;
        is_pos++;
        if (is_pos >= consts.SamplesPerGr) {
          break;
        }
        mainData.Is[gr][ch][is_pos] = result.x;
        is_pos++;
        if (is_pos >= consts.SamplesPerGr) {
          break;
        }
        mainData.Is[gr][ch][is_pos] = result.y;
        is_pos++;
      }
      if (m.BitPos() > bit_pos_end + 1) {
        is_pos -= 4;
      }
      sideInfo.Count1[gr][ch] = is_pos;
      for (; is_pos < consts.SamplesPerGr; ) {
        mainData.Is[gr][ch][is_pos] = 0;
        is_pos++;
      }
      m.SetPos(bit_pos_end + 1);
      return null;
    };
    module2.exports = MainData;
  }
});

// node_modules/js-mp3/src/sideinfo.js
var require_sideinfo = __commonJS({
  "node_modules/js-mp3/src/sideinfo.js"(exports2, module2) {
    init_globals();
    var Bits = require_bits();
    var consts = require_consts();
    var util = require_util();
    var Sideinfo = {
      createNew: function() {
        var sideinfo = {};
        util.init2dArray(sideinfo, "Scfsi", 2, 4);
        util.init2dArray(sideinfo, "Part2_3Length", 2, 2);
        util.init2dArray(sideinfo, "BigValues", 2, 2);
        util.init2dArray(sideinfo, "GlobalGain", 2, 2);
        util.init2dArray(sideinfo, "ScalefacCompress", 2, 2);
        util.init2dArray(sideinfo, "WinSwitchFlag", 2, 2);
        util.init2dArray(sideinfo, "BlockType", 2, 2);
        util.init2dArray(sideinfo, "MixedBlockFlag", 2, 2);
        util.init3dArray(sideinfo, "TableSelect", 2, 2, 3);
        util.init3dArray(sideinfo, "SubblockGain", 2, 2, 3);
        util.init2dArray(sideinfo, "Region0Count", 2, 2);
        util.init2dArray(sideinfo, "Region1Count", 2, 2);
        util.init2dArray(sideinfo, "Preflag", 2, 2);
        util.init2dArray(sideinfo, "ScalefacScale", 2, 2);
        util.init2dArray(sideinfo, "Count1TableSelect", 2, 2);
        util.init2dArray(sideinfo, "Count1", 2, 2);
        return sideinfo;
      },
      read: function(source, fheader, pos) {
        var nch = fheader.numberOfChannels();
        var framesize = fheader.frameSize();
        if (framesize > 2e3) {
          return {
            v: null,
            err: "mp3: framesize = " + framesize
          };
        }
        var sideinfo_size = 32;
        if (nch === 1) {
          sideinfo_size = 17;
        }
        var main_data_size = framesize - sideinfo_size - 4;
        if (fheader.protectionBit() === 0) {
          main_data_size -= 2;
        }
        var result = source.readFull(sideinfo_size);
        if (result.err) {
          return {
            err: result.err
          };
        }
        var buf = result.buf;
        if (buf.byteLength < sideinfo_size) {
          return {
            v: null,
            pos,
            err: "mp3: couldn't read sideinfo " + sideinfo_size + " bytes"
          };
        }
        var s = Bits.createNew(new Uint8Array(buf.slice()).buffer);
        var si = Sideinfo.createNew();
        si.MainDataBegin = s.Bits(9);
        if (fheader.mode() === consts.ModeSingleChannel) {
          si.PrivateBits = s.Bits(5);
        } else {
          si.PrivateBits = s.Bits(3);
        }
        for (var ch = 0; ch < nch; ch++) {
          for (var scfsi_band = 0; scfsi_band < 4; scfsi_band++) {
            si.Scfsi[ch][scfsi_band] = s.Bits(1);
          }
        }
        for (var gr = 0; gr < 2; gr++) {
          for (var ch = 0; ch < nch; ch++) {
            si.Part2_3Length[gr][ch] = s.Bits(12);
            si.BigValues[gr][ch] = s.Bits(9);
            si.GlobalGain[gr][ch] = s.Bits(8);
            si.ScalefacCompress[gr][ch] = s.Bits(4);
            si.WinSwitchFlag[gr][ch] = s.Bits(1);
            if (si.WinSwitchFlag[gr][ch] === 1) {
              si.BlockType[gr][ch] = s.Bits(2);
              si.MixedBlockFlag[gr][ch] = s.Bits(1);
              for (var region = 0; region < 2; region++) {
                si.TableSelect[gr][ch][region] = s.Bits(5);
              }
              for (var window = 0; window < 3; window++) {
                si.SubblockGain[gr][ch][window] = s.Bits(3);
              }
              if (si.BlockType[gr][ch] === 2 && si.MixedBlockFlag[gr][ch] === 0) {
                si.Region0Count[gr][ch] = 8;
              } else {
                si.Region0Count[gr][ch] = 7;
              }
              si.Region1Count[gr][ch] = 20 - si.Region0Count[gr][ch];
            } else {
              for (var region = 0; region < 3; region++) {
                si.TableSelect[gr][ch][region] = s.Bits(5);
              }
              si.Region0Count[gr][ch] = s.Bits(4);
              si.Region1Count[gr][ch] = s.Bits(3);
              si.BlockType[gr][ch] = 0;
            }
            si.Preflag[gr][ch] = s.Bits(1);
            si.ScalefacScale[gr][ch] = s.Bits(1);
            si.Count1TableSelect[gr][ch] = s.Bits(1);
          }
        }
        return {
          v: si,
          err: null
        };
      }
    };
    module2.exports = Sideinfo;
  }
});

// node_modules/js-mp3/src/frame.js
var require_frame = __commonJS({
  "node_modules/js-mp3/src/frame.js"(exports2, module2) {
    init_globals();
    var consts = require_consts();
    var util = require_util();
    var Frameheader = require_frameheader();
    var Imdct = require_imdct();
    var Maindata = require_maindata();
    var Sideinfo = require_sideinfo();
    var powtab34 = new Float64Array(8207);
    var pretab_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3, 3, 2, 0];
    var pretab = new Float64Array(pretab_data.length);
    pretab.set(pretab_data);
    for (i = 0; i < powtab34.length; i++) {
      powtab34[i] = Math.pow(i, 4 / 3);
    }
    var i;
    var synthNWin = [];
    for (i = 0; i < 64; i++) {
      synthNWin.push(new Float32Array(32));
    }
    var i;
    for (i = 0; i < 64; i++) {
      for (j = 0; j < 32; j++) {
        synthNWin[i][j] = Math.cos((16 + i) * (2 * j + 1) * (Math.PI / 64));
      }
    }
    var j;
    var i;
    var synthDtbl = new Float32Array([
      0,
      -15259e-9,
      -15259e-9,
      -15259e-9,
      -15259e-9,
      -15259e-9,
      -15259e-9,
      -30518e-9,
      -30518e-9,
      -30518e-9,
      -30518e-9,
      -45776e-9,
      -45776e-9,
      -61035e-9,
      -61035e-9,
      -76294e-9,
      -76294e-9,
      -91553e-9,
      -106812e-9,
      -106812e-9,
      -12207e-8,
      -137329e-9,
      -152588e-9,
      -167847e-9,
      -198364e-9,
      -213623e-9,
      -244141e-9,
      -259399e-9,
      -289917e-9,
      -320435e-9,
      -366211e-9,
      -396729e-9,
      -442505e-9,
      -473022e-9,
      -534058e-9,
      -579834e-9,
      -62561e-8,
      -686646e-9,
      -747681e-9,
      -808716e-9,
      -88501e-8,
      -961304e-9,
      -1037598e-9,
      -1113892e-9,
      -1205444e-9,
      -1296997e-9,
      -138855e-8,
      -1480103e-9,
      -1586914e-9,
      -1693726e-9,
      -1785278e-9,
      -1907349e-9,
      -201416e-8,
      -2120972e-9,
      -2243042e-9,
      -2349854e-9,
      -2456665e-9,
      -2578735e-9,
      -2685547e-9,
      -2792358e-9,
      -289917e-8,
      -2990723e-9,
      -3082275e-9,
      -3173828e-9,
      3250122e-9,
      3326416e-9,
      3387451e-9,
      3433228e-9,
      3463745e-9,
      3479004e-9,
      3479004e-9,
      3463745e-9,
      3417969e-9,
      3372192e-9,
      328064e-8,
      3173828e-9,
      3051758e-9,
      2883911e-9,
      2700806e-9,
      2487183e-9,
      2227783e-9,
      1937866e-9,
      1617432e-9,
      1266479e-9,
      869751e-9,
      442505e-9,
      -30518e-9,
      -549316e-9,
      -1098633e-9,
      -1693726e-9,
      -2334595e-9,
      -3005981e-9,
      -3723145e-9,
      -4486084e-9,
      -52948e-7,
      -6118774e-9,
      -7003784e-9,
      -7919312e-9,
      -8865356e-9,
      -9841919e-9,
      -0.010848999,
      -0.011886597,
      -0.012939453,
      -0.014022827,
      -0.01512146,
      -0.016235352,
      -0.017349243,
      -0.018463135,
      -0.019577026,
      -0.020690918,
      -0.021789551,
      -0.022857666,
      -0.023910522,
      -0.024932861,
      -0.025909424,
      -0.02684021,
      -0.02772522,
      -0.028533936,
      -0.029281616,
      -0.029937744,
      -0.030532837,
      -0.031005859,
      -0.031387329,
      -0.031661987,
      -0.031814575,
      -0.031845093,
      -0.031738281,
      -0.031478882,
      0.031082153,
      0.030517578,
      0.029785156,
      0.028884888,
      0.027801514,
      0.026535034,
      0.025085449,
      0.023422241,
      0.021575928,
      0.01953125,
      0.01725769,
      0.014801025,
      0.012115479,
      9231567e-9,
      6134033e-9,
      2822876e-9,
      -686646e-9,
      -4394531e-9,
      -831604e-8,
      -0.012420654,
      -0.016708374,
      -0.021179199,
      -0.025817871,
      -0.030609131,
      -0.035552979,
      -0.040634155,
      -0.045837402,
      -0.051132202,
      -0.056533813,
      -0.06199646,
      -0.067520142,
      -0.073059082,
      -0.07862854,
      -0.084182739,
      -0.089706421,
      -0.095169067,
      -0.100540161,
      -0.105819702,
      -0.110946655,
      -0.115921021,
      -0.120697021,
      -0.125259399,
      -0.129562378,
      -0.133590698,
      -0.137298584,
      -0.140670776,
      -0.143676758,
      -0.146255493,
      -0.148422241,
      -0.150115967,
      -0.151306152,
      -0.15196228,
      -0.152069092,
      -0.151596069,
      -0.150497437,
      -0.148773193,
      -0.146362305,
      -0.143264771,
      -0.139450073,
      -0.134887695,
      -0.129577637,
      -0.123474121,
      -0.116577148,
      -0.108856201,
      0.100311279,
      0.090927124,
      0.080688477,
      0.069595337,
      0.057617188,
      0.044784546,
      0.031082153,
      0.01651001,
      1068115e-9,
      -0.015228271,
      -0.03237915,
      -0.050354004,
      -0.069168091,
      -0.088775635,
      -0.109161377,
      -0.130310059,
      -0.152206421,
      -0.174789429,
      -0.198059082,
      -0.221984863,
      -0.246505737,
      -0.271591187,
      -0.297210693,
      -0.323318481,
      -0.349868774,
      -0.376800537,
      -0.404083252,
      -0.431655884,
      -0.459472656,
      -0.487472534,
      -0.515609741,
      -0.543823242,
      -0.572036743,
      -0.600219727,
      -0.628295898,
      -0.656219482,
      -0.683914185,
      -0.71131897,
      -0.738372803,
      -0.765029907,
      -0.791213989,
      -0.816864014,
      -0.841949463,
      -0.866363525,
      -0.890090942,
      -0.91305542,
      -0.935195923,
      -0.956481934,
      -0.976852417,
      -0.996246338,
      -1.01461792,
      -1.031936646,
      -1.048156738,
      -1.063217163,
      -1.07711792,
      -1.089782715,
      -1.101211548,
      -1.111373901,
      -1.120223999,
      -1.127746582,
      -1.133926392,
      -1.138763428,
      -1.142211914,
      -1.144287109,
      1.144989014,
      1.144287109,
      1.142211914,
      1.138763428,
      1.133926392,
      1.127746582,
      1.120223999,
      1.111373901,
      1.101211548,
      1.089782715,
      1.07711792,
      1.063217163,
      1.048156738,
      1.031936646,
      1.01461792,
      0.996246338,
      0.976852417,
      0.956481934,
      0.935195923,
      0.91305542,
      0.890090942,
      0.866363525,
      0.841949463,
      0.816864014,
      0.791213989,
      0.765029907,
      0.738372803,
      0.71131897,
      0.683914185,
      0.656219482,
      0.628295898,
      0.600219727,
      0.572036743,
      0.543823242,
      0.515609741,
      0.487472534,
      0.459472656,
      0.431655884,
      0.404083252,
      0.376800537,
      0.349868774,
      0.323318481,
      0.297210693,
      0.271591187,
      0.246505737,
      0.221984863,
      0.198059082,
      0.174789429,
      0.152206421,
      0.130310059,
      0.109161377,
      0.088775635,
      0.069168091,
      0.050354004,
      0.03237915,
      0.015228271,
      -1068115e-9,
      -0.01651001,
      -0.031082153,
      -0.044784546,
      -0.057617188,
      -0.069595337,
      -0.080688477,
      -0.090927124,
      0.100311279,
      0.108856201,
      0.116577148,
      0.123474121,
      0.129577637,
      0.134887695,
      0.139450073,
      0.143264771,
      0.146362305,
      0.148773193,
      0.150497437,
      0.151596069,
      0.152069092,
      0.15196228,
      0.151306152,
      0.150115967,
      0.148422241,
      0.146255493,
      0.143676758,
      0.140670776,
      0.137298584,
      0.133590698,
      0.129562378,
      0.125259399,
      0.120697021,
      0.115921021,
      0.110946655,
      0.105819702,
      0.100540161,
      0.095169067,
      0.089706421,
      0.084182739,
      0.07862854,
      0.073059082,
      0.067520142,
      0.06199646,
      0.056533813,
      0.051132202,
      0.045837402,
      0.040634155,
      0.035552979,
      0.030609131,
      0.025817871,
      0.021179199,
      0.016708374,
      0.012420654,
      831604e-8,
      4394531e-9,
      686646e-9,
      -2822876e-9,
      -6134033e-9,
      -9231567e-9,
      -0.012115479,
      -0.014801025,
      -0.01725769,
      -0.01953125,
      -0.021575928,
      -0.023422241,
      -0.025085449,
      -0.026535034,
      -0.027801514,
      -0.028884888,
      -0.029785156,
      -0.030517578,
      0.031082153,
      0.031478882,
      0.031738281,
      0.031845093,
      0.031814575,
      0.031661987,
      0.031387329,
      0.031005859,
      0.030532837,
      0.029937744,
      0.029281616,
      0.028533936,
      0.02772522,
      0.02684021,
      0.025909424,
      0.024932861,
      0.023910522,
      0.022857666,
      0.021789551,
      0.020690918,
      0.019577026,
      0.018463135,
      0.017349243,
      0.016235352,
      0.01512146,
      0.014022827,
      0.012939453,
      0.011886597,
      0.010848999,
      9841919e-9,
      8865356e-9,
      7919312e-9,
      7003784e-9,
      6118774e-9,
      52948e-7,
      4486084e-9,
      3723145e-9,
      3005981e-9,
      2334595e-9,
      1693726e-9,
      1098633e-9,
      549316e-9,
      30518e-9,
      -442505e-9,
      -869751e-9,
      -1266479e-9,
      -1617432e-9,
      -1937866e-9,
      -2227783e-9,
      -2487183e-9,
      -2700806e-9,
      -2883911e-9,
      -3051758e-9,
      -3173828e-9,
      -328064e-8,
      -3372192e-9,
      -3417969e-9,
      -3463745e-9,
      -3479004e-9,
      -3479004e-9,
      -3463745e-9,
      -3433228e-9,
      -3387451e-9,
      -3326416e-9,
      3250122e-9,
      3173828e-9,
      3082275e-9,
      2990723e-9,
      289917e-8,
      2792358e-9,
      2685547e-9,
      2578735e-9,
      2456665e-9,
      2349854e-9,
      2243042e-9,
      2120972e-9,
      201416e-8,
      1907349e-9,
      1785278e-9,
      1693726e-9,
      1586914e-9,
      1480103e-9,
      138855e-8,
      1296997e-9,
      1205444e-9,
      1113892e-9,
      1037598e-9,
      961304e-9,
      88501e-8,
      808716e-9,
      747681e-9,
      686646e-9,
      62561e-8,
      579834e-9,
      534058e-9,
      473022e-9,
      442505e-9,
      396729e-9,
      366211e-9,
      320435e-9,
      289917e-9,
      259399e-9,
      244141e-9,
      213623e-9,
      198364e-9,
      167847e-9,
      152588e-9,
      137329e-9,
      12207e-8,
      106812e-9,
      106812e-9,
      91553e-9,
      76294e-9,
      76294e-9,
      61035e-9,
      61035e-9,
      45776e-9,
      45776e-9,
      30518e-9,
      30518e-9,
      30518e-9,
      30518e-9,
      15259e-9,
      15259e-9,
      15259e-9,
      15259e-9,
      15259e-9,
      15259e-9
    ], 0, 512);
    var cs = new Float32Array([
      0.857493,
      0.881742,
      0.949629,
      0.983315,
      0.995518,
      0.999161,
      0.999899,
      0.999993
    ]);
    var ca = new Float32Array([
      -0.514496,
      -0.471732,
      -0.313377,
      -0.181913,
      -0.094574,
      -0.040966,
      -0.014199,
      -37e-4
    ]);
    var isRatios = [0, 0.267949, 0.57735, 1, 1.732051, 3.732051];
    var Frame = {
      createNew: function(header, sideInfo, mainData, mainDataBits) {
        var frame = {
          header,
          sideInfo,
          mainData,
          mainDataBits
        };
        frame.store = new Array(2);
        for (var i2 = 0; i2 < frame.store.length; i2++) {
          var a = new Array(32);
          for (var j2 = 0; j2 < a.length; j2++) {
            a[j2] = new Float32Array(18);
          }
          frame.store[i2] = a;
        }
        frame.v_vec = new Array(2);
        for (var i2 = 0; i2 < frame.v_vec.length; i2++) {
          frame.v_vec[i2] = new Float32Array(1024);
        }
        frame.decode = function() {
          var nch = frame.header.numberOfChannels();
          var out;
          if (nch === 1) {
            out = new Uint8Array(consts.BytesPerFrame / 2);
          } else {
            out = new Uint8Array(consts.BytesPerFrame);
          }
          for (var gr = 0; gr < 2; gr++) {
            for (var ch = 0; ch < nch; ch++) {
              frame.requantize(gr, ch);
              frame.reorder(gr, ch);
            }
            frame.stereo(gr);
            for (var ch = 0; ch < nch; ch++) {
              frame.antialias(gr, ch);
              frame.hybridSynthesis(gr, ch);
              frame.frequencyInversion(gr, ch);
              if (nch === 1) {
                frame.subbandSynthesis(gr, ch, out.subarray(consts.SamplesPerGr * 4 * gr / 2));
              } else {
                frame.subbandSynthesis(gr, ch, out.subarray(consts.SamplesPerGr * 4 * gr));
              }
            }
          }
          return out;
        };
        frame.antialias = function(gr, ch) {
          if (frame.sideInfo.WinSwitchFlag[gr][ch] === 1 && frame.sideInfo.BlockType[gr][ch] === 2 && frame.sideInfo.MixedBlockFlag[gr][ch] === 0) {
            return;
          }
          var sblim = 32;
          if (frame.sideInfo.WinSwitchFlag[gr][ch] === 1 && frame.sideInfo.BlockType[gr][ch] === 2 && frame.sideInfo.MixedBlockFlag[gr][ch] === 1) {
            sblim = 2;
          }
          for (var sb = 1; sb < sblim; sb++) {
            for (var i3 = 0; i3 < 8; i3++) {
              var li = 18 * sb - 1 - i3;
              var ui = 18 * sb + i3;
              var lb = frame.mainData.Is[gr][ch][li] * cs[i3] - frame.mainData.Is[gr][ch][ui] * ca[i3];
              var ub = frame.mainData.Is[gr][ch][ui] * cs[i3] + frame.mainData.Is[gr][ch][li] * ca[i3];
              frame.mainData.Is[gr][ch][li] = lb;
              frame.mainData.Is[gr][ch][ui] = ub;
            }
          }
        };
        frame.hybridSynthesis = function(gr, ch) {
          for (var sb = 0; sb < 32; sb++) {
            var bt = frame.sideInfo.BlockType[gr][ch];
            if (frame.sideInfo.WinSwitchFlag[gr][ch] === 1 && frame.sideInfo.MixedBlockFlag[gr][ch] === 1 && sb < 2) {
              bt = 0;
            }
            var inData = new Float32Array(18);
            for (var i3 = 0; i3 < 18; i3++) {
              inData[i3] = frame.mainData.Is[gr][ch][sb * 18 + i3];
            }
            var rawout = Imdct.Win(inData, bt);
            for (var i3 = 0; i3 < 18; i3++) {
              frame.mainData.Is[gr][ch][sb * 18 + i3] = rawout[i3] + frame.store[ch][sb][i3];
              frame.store[ch][sb][i3] = rawout[i3 + 18];
            }
          }
        };
        frame.frequencyInversion = function(gr, ch) {
          for (var sb = 1; sb < 32; sb += 2) {
            for (var i3 = 1; i3 < 18; i3 += 2) {
              frame.mainData.Is[gr][ch][sb * 18 + i3] = -frame.mainData.Is[gr][ch][sb * 18 + i3];
            }
          }
        };
        frame.stereo = function(gr) {
          if (frame.header.useMSStereo()) {
            var i3 = 1;
            if (frame.sideInfo.Count1[gr][0] > frame.sideInfo.Count1[gr][1]) {
              i3 = 0;
            }
            var max_pos = frame.sideInfo.Count1[gr][i3];
            const invSqrt2 = Math.SQRT2 / 2;
            for (var i3 = 0; i3 < max_pos; i3++) {
              var left = (frame.mainData.Is[gr][0][i3] + frame.mainData.Is[gr][1][i3]) * invSqrt2;
              var right = (frame.mainData.Is[gr][0][i3] - frame.mainData.Is[gr][1][i3]) * invSqrt2;
              frame.mainData.Is[gr][0][i3] = left;
              frame.mainData.Is[gr][1][i3] = right;
            }
          }
          if (frame.header.useIntensityStereo()) {
            var sfreq = frame.header.samplingFrequency();
            if (frame.sideInfo.WinSwitchFlag[gr][0] === 1 && frame.sideInfo.BlockType[gr][0] === 2) {
              if (frame.sideInfo.MixedBlockFlag[gr][0] !== 0) {
                for (var sfb = 0; sfb < 8; sfb++) {
                  if (consts.SfBandIndicesSet[sfreq].L[sfb] >= frame.sideInfo.Count1[gr][1]) {
                    frame.stereoProcessIntensityLong(gr, sfb);
                  }
                }
                for (var sfb = 3; sfb < 12; sfb++) {
                  if (consts.SfBandIndicesSet[sfreq].S[sfb] * 3 >= frame.sideInfo.Count1[gr][1]) {
                    frame.stereoProcessIntensityShort(gr, sfb);
                  }
                }
              } else {
                for (var sfb = 0; sfb < 12; sfb++) {
                  if (consts.SfBandIndicesSet[sfreq].S[sfb] * 3 >= frame.sideInfo.Count1[gr][1]) {
                    frame.stereoProcessIntensityShort(gr, sfb);
                  }
                }
              }
            } else {
              for (var sfb = 0; sfb < 21; sfb++) {
                if (consts.SfBandIndicesSet[sfreq].L[sfb] >= frame.sideInfo.Count1[gr][1]) {
                  frame.stereoProcessIntensityLong(gr, sfb);
                }
              }
            }
          }
        };
        frame.stereoProcessIntensityLong = function(gr, sfb) {
          var is_ratio_l = 0;
          var is_ratio_r = 0;
          var is_pos = frame.mainData.ScalefacL[gr][0][sfb];
          if (is_pos < 7) {
            var sfreq = frame.header.samplingFrequency().value;
            var sfb_start = consts.SfBandIndicesSet[sfreq].L[sfb];
            var sfb_stop = consts.SfBandIndicesSet[sfreq].L[sfb + 1];
            if (is_pos === 6) {
              is_ratio_l = 1;
              is_ratio_r = 0;
            } else {
              is_ratio_l = isRatios[is_pos] / (1 + isRatios[is_pos]);
              is_ratio_r = 1 / (1 + isRatios[is_pos]);
            }
            for (var i3 = sfb_start; i3 < sfb_stop; i3++) {
              frame.mainData.Is[gr][0][i3] *= is_ratio_l;
              frame.mainData.Is[gr][1][i3] *= is_ratio_r;
            }
          }
        };
        frame.stereoProcessIntensityShort = function(gr, sfb) {
          var is_ratio_l = 0;
          var is_ratio_r = 0;
          var sfreq = frame.header.samplingFrequency().value;
          var win_len = consts.SfBandIndicesSet[sfreq].S[sfb + 1] - consts.SfBandIndicesSet[sfreq].S[sfb];
          for (var win = 0; win < 3; win++) {
            var is_pos = frame.mainData.ScalefacS[gr][0][sfb][win];
            if (is_pos < 7) {
              var sfb_start = consts.SfBandIndicesSet[sfreq].S[sfb] * 3 + win_len * win;
              var sfb_stop = sfb_start + win_len;
              if (is_pos === 6) {
                is_ratio_l = 1;
                is_ratio_r = 0;
              } else {
                is_ratio_l = isRatios[is_pos] / (1 + isRatios[is_pos]);
                is_ratio_r = 1 / (1 + isRatios[is_pos]);
              }
              for (var i3 = sfb_start; i3 < sfb_stop; i3++) {
                frame.mainData.Is[gr][0][i3] *= is_ratio_l;
                frame.mainData.Is[gr][1][i3] *= is_ratio_r;
              }
            }
          }
        };
        frame.requantize = function(gr, ch) {
          var sfreq = frame.header.samplingFrequency().value;
          if (frame.sideInfo.WinSwitchFlag[gr][ch] === 1 && frame.sideInfo.BlockType[gr][ch] === 2) {
            if (frame.sideInfo.MixedBlockFlag[gr][ch] !== 0) {
              var sfb = 0;
              var next_sfb = consts.SfBandIndicesSet[sfreq].L[sfb + 1];
              for (var i3 = 0; i3 < 36; i3++) {
                if (i3 === next_sfb) {
                  sfb++;
                  next_sfb = consts.SfBandIndicesSet[sfreq].L[sfb + 1];
                }
                frame.requantizeProcessLong(gr, ch, i3, sfb);
              }
              sfb = 3;
              next_sfb = consts.SfBandIndicesSet[sfreq].S[sfb + 1] * 3;
              var win_len = consts.SfBandIndicesSet[sfreq].S[sfb + 1] - consts.SfBandIndicesSet[sfreq].S[sfb];
              for (var i3 = 36; i3 < int(f.sideInfo.Count1[gr][ch]); ) {
                if (i3 === next_sfb) {
                  sfb++;
                  next_sfb = consts.SfBandIndicesSet[sfreq].S[sfb + 1] * 3;
                  win_len = consts.SfBandIndicesSet[sfreq].S[sfb + 1] - consts.SfBandIndicesSet[sfreq].S[sfb];
                }
                for (var win = 0; win < 3; win++) {
                  for (var j3 = 0; j3 < win_len; j3++) {
                    frame.requantizeProcessShort(gr, ch, i3, sfb, win);
                    i3++;
                  }
                }
              }
            } else {
              var sfb = 0;
              var next_sfb = consts.SfBandIndicesSet[sfreq].S[sfb + 1] * 3;
              var win_len = consts.SfBandIndicesSet[sfreq].S[sfb + 1] - consts.SfBandIndicesSet[sfreq].S[sfb];
              for (var i3 = 0; i3 < frame.sideInfo.Count1[gr][ch]; ) {
                if (i3 === next_sfb) {
                  sfb++;
                  next_sfb = consts.SfBandIndicesSet[sfreq].S[sfb + 1] * 3;
                  win_len = consts.SfBandIndicesSet[sfreq].S[sfb + 1] - consts.SfBandIndicesSet[sfreq].S[sfb];
                }
                for (var win = 0; win < 3; win++) {
                  for (var j3 = 0; j3 < win_len; j3++) {
                    frame.requantizeProcessShort(gr, ch, i3, sfb, win);
                    i3++;
                  }
                }
              }
            }
          } else {
            var sfb = 0;
            var next_sfb = consts.SfBandIndicesSet[sfreq].L[sfb + 1];
            for (var i3 = 0; i3 < frame.sideInfo.Count1[gr][ch]; i3++) {
              if (i3 === next_sfb) {
                sfb++;
                next_sfb = consts.SfBandIndicesSet[sfreq].L[sfb + 1];
              }
              frame.requantizeProcessLong(gr, ch, i3, sfb);
            }
          }
        };
        frame.requantizeProcessLong = function(gr, ch, is_pos, sfb) {
          var sf_mult = 0.5;
          if (frame.sideInfo.ScalefacScale[gr][ch] !== 0) {
            sf_mult = 1;
          }
          var pf_x_pt = frame.sideInfo.Preflag[gr][ch] * pretab[sfb];
          var idx = -(sf_mult * (frame.mainData.ScalefacL[gr][ch][sfb] + pf_x_pt)) + 0.25 * (frame.sideInfo.GlobalGain[gr][ch] - 210);
          var tmp1 = Math.pow(2, idx);
          var tmp2 = 0;
          if (frame.mainData.Is[gr][ch][is_pos] < 0) {
            tmp2 = -powtab34[-frame.mainData.Is[gr][ch][is_pos]];
          } else {
            tmp2 = powtab34[frame.mainData.Is[gr][ch][is_pos]];
          }
          frame.mainData.Is[gr][ch][is_pos] = tmp1 * tmp2;
        };
        frame.requantizeProcessShort = function(gr, ch, is_pos, sfb, win) {
          var sf_mult = 0.5;
          if (frame.sideInfo.ScalefacScale[gr][ch] !== 0) {
            sf_mult = 1;
          }
          var idx = -(sf_mult * frame.mainData.ScalefacS[gr][ch][sfb][win]) + 0.25 * (frame.sideInfo.GlobalGain[gr][ch] - 210 - 8 * frame.sideInfo.SubblockGain[gr][ch][win]);
          var tmp1 = Math.pow(2, idx);
          var tmp2 = 0;
          if (frame.mainData.Is[gr][ch][is_pos] < 0) {
            tmp2 = -powtab34[-frame.mainData.Is[gr][ch][is_pos]];
          } else {
            tmp2 = powtab34[frame.mainData.Is[gr][ch][is_pos]];
          }
          frame.mainData.Is[gr][ch][is_pos] = tmp1 * tmp2;
        };
        frame.reorder = function(gr, ch) {
          var re = new Float32Array(consts.SamplesPerGr);
          var sfreq = frame.header.samplingFrequency().value;
          if (frame.sideInfo.WinSwitchFlag[gr][ch] === 1 && frame.sideInfo.BlockType[gr][ch] == 2) {
            var sfb = 0;
            if (frame.sideInfo.MixedBlockFlag[gr][ch] !== 0) {
              sfb = 3;
            }
            var next_sfb = consts.SfBandIndicesSet[sfreq].S[sfb + 1] * 3;
            var win_len = consts.SfBandIndicesSet[sfreq].S[sfb + 1] - consts.SfBandIndicesSet[sfreq].S[sfb];
            var i3 = 36;
            if (sfb === 0) {
              i3 = 0;
            }
            for (; i3 < consts.SamplesPerGr; ) {
              if (i3 === next_sfb) {
                var j3 = 3 * consts.SfBandIndicesSet[sfreq].S[sfb];
                for (var s = 0; s < 3 * win_len; s++) {
                  frame.mainData.Is[gr][ch][j3 + s] = re[s];
                }
                if (i3 >= frame.sideInfo.Count1[gr][ch]) {
                  return;
                }
                sfb++;
                next_sfb = consts.SfBandIndicesSet[sfreq].S[sfb + 1] * 3;
                win_len = consts.SfBandIndicesSet[sfreq].S[sfb + 1] - consts.SfBandIndicesSet[sfreq].S[sfb];
              }
              for (var win = 0; win < 3; win++) {
                for (j3 = 0; j3 < win_len; j3++) {
                  re[j3 * 3 + win] = frame.mainData.Is[gr][ch][i3];
                  i3++;
                }
              }
            }
            var j3 = 3 * consts.SfBandIndicesSet[sfreq].S[12];
            for (var s = 0; s < 3 * win_len; s++) {
              frame.mainData.Is[gr][ch][j3 + s] = re[s];
            }
          }
        };
        frame.subbandSynthesis = function(gr, ch, out) {
          var u_vec = new Float32Array(512);
          var s_vec = new Float32Array(32);
          var nch = frame.header.numberOfChannels();
          for (var ss = 0; ss < 18; ss++) {
            frame.v_vec[ch].set(frame.v_vec[ch].slice(0, 1024 - 64), 64);
            var d = frame.mainData.Is[gr][ch];
            for (var i3 = 0; i3 < 32; i3++) {
              s_vec[i3] = d[i3 * 18 + ss];
            }
            for (var i3 = 0; i3 < 64; i3++) {
              var sum = 0;
              for (var j3 = 0; j3 < 32; j3++) {
                sum += synthNWin[i3][j3] * s_vec[j3];
              }
              frame.v_vec[ch][i3] = sum;
            }
            var v = frame.v_vec[ch];
            for (var i3 = 0; i3 < 512; i3 += 64) {
              u_vec.set(v.slice(i3 << 1 >>> 0, (i3 << 1 >>> 0) + 32), i3);
              u_vec.set(v.slice((i3 << 1 >>> 0) + 96, (i3 << 1 >>> 0) + 128), i3 + 32);
            }
            for (var i3 = 0; i3 < 512; i3++) {
              u_vec[i3] *= synthDtbl[i3];
            }
            for (var i3 = 0; i3 < 32; i3++) {
              var sum = 0;
              for (var j3 = 0; j3 < 512; j3 += 32) {
                sum += u_vec[j3 + i3];
              }
              var samp = sum * 32767;
              if (samp > 32767) {
                samp = 32767;
              } else if (samp < -32767) {
                samp = -32767;
              }
              var s = samp;
              var idx;
              if (nch === 1) {
                idx = 2 * (32 * ss + i3);
              } else {
                idx = 4 * (32 * ss + i3);
              }
              if (ch === 0) {
                out[idx] = s;
                out[idx + 1] = s >>> 8 >>> 0;
              } else {
                out[idx + 2] = s;
                out[idx + 3] = s >>> 8 >>> 0;
              }
            }
          }
          return out;
        };
        frame.samplingFrequency = function() {
          return frame.header.samplingFrequency().Int();
        };
        return frame;
      },
      readCRC: function(source) {
        var result = source.readFull(2);
        if (result.err) {
          return {
            err: result.err
          };
        }
        var buf = result.buf;
        if (buf.byteLength < 2) {
          return "mp3: error at readCRC";
        }
      },
      read: function(source, position, prev) {
        var rr = Frameheader.read(source, position);
        if (rr.err) {
          return {
            f: null,
            position: 0,
            err: rr.err
          };
        }
        var pos = rr.position;
        var fh = rr.h;
        if (fh.protectionBit() === 0) {
          var err2 = Frame.readCRC(source);
          if (typeof err2 !== "undefined") {
            return {
              f: null,
              position: 0,
              err: err2
            };
          }
        }
        if (fh.id() !== consts.Version1) {
          return {
            f: null,
            position: 0,
            err: "mp3: only MPEG version 1 (want " + consts.Version1 + "; got " + fh.id() + ") is supported"
          };
        }
        if (fh.layer() !== consts.Layer3) {
          return {
            f: null,
            position: 0,
            err: "mp3: only layer3 (want " + consts.Version1 + "; got " + fh.layer() + ") is supported"
          };
        }
        var result = Sideinfo.read(source, fh, pos);
        if (result.err) {
          return {
            f: null,
            position: 0,
            err: result.err
          };
        }
        var si = result.v;
        var prevM = null;
        if (prev) {
          prevM = prev.mainDataBits;
        }
        result = Maindata.read(source, prevM, fh, si);
        if (result.err) {
          return {
            f: null,
            position: 0,
            err: result.err
          };
        }
        var f2 = Frame.createNew(fh, si, result.v, result.bits);
        if (prev) {
          f2.store = prev.store;
          f2.v_vec = prev.v_vec;
        }
        return {
          f: f2,
          position: pos,
          err: null
        };
      }
    };
    module2.exports = Frame;
  }
});

// node_modules/js-mp3/src/decode.js
var require_decode = __commonJS({
  "node_modules/js-mp3/src/decode.js"(exports2, module2) {
    init_globals();
    var Frame = require_frame();
    var util = require_util();
    var consts = require_consts();
    var Frameheader = require_frameheader();
    var invalidLength = -1;
    var Mp32 = {
      // Create new source object with specified ArrayBuffer
      newSource: function(buf) {
        var source = {
          buf,
          pos: 0
        };
        source.seek = function(position) {
          if (position < 0 || position > source.buf.byteLength) {
            return {
              err: "position not correct"
            };
          }
          source.pos = position;
          return {
            pos: source.pos
          };
        };
        source.readFull = function(length) {
          try {
            var l = Math.min(source.buf.byteLength - source.pos, length);
            var buf2 = new Uint8Array(source.buf, source.pos, l);
            source.pos += buf2.byteLength;
            return {
              buf: buf2,
              err: null
            };
          } catch (e) {
            return {
              buf: null,
              err: e.toString()
            };
          }
        };
        source.getPos = function() {
          if (source.pos > 3) {
            return source.pos - 3;
          }
          return source.pos;
        };
        source.skipTags = function() {
          var result = source.readFull(3);
          if (result.err) {
            return {
              err: result.err
            };
          }
          var buf2 = result.buf;
          var t = String.fromCharCode.apply(null, buf2);
          switch (t) {
            case "TAG":
              result = source.readFull(125);
              if (result.err) {
                return {
                  err: result.err
                };
              }
              buf2 = result.buf;
              break;
            case "ID3":
              result = source.readFull(3);
              if (result.err) {
                return {
                  err: result.err
                };
              }
              result = source.readFull(4);
              if (result.err) {
                return {
                  err: result.err
                };
              }
              buf2 = result.buf;
              if (buf2.byteLength !== 4) {
                return {
                  err: "data not enough."
                };
              }
              var size = buf2[0] >>> 0 << 21 >>> 0 | buf2[1] >>> 0 << 14 >>> 0 | buf2[2] >>> 0 << 7 >>> 0 | buf2[3] >>> 0;
              result = source.readFull(size);
              if (result.err) {
                return {
                  err: result.err
                };
              }
              buf2 = result.buf;
              break;
            default:
              source.unread(buf2);
              break;
          }
          return {};
        };
        source.unread = function(buf2) {
          source.pos -= buf2.byteLength;
        };
        source.rewind = function() {
          source.pos = 0;
        };
        return source;
      },
      newDecoder: function(buf) {
        var s = Mp32.newSource(buf);
        var decoder = {
          source: s,
          sampleRate: 0,
          frame: null,
          frameStarts: [],
          buf: null,
          pos: 0,
          length: invalidLength
        };
        decoder.readFrame = function() {
          var result2 = Frame.read(decoder.source, decoder.source.pos, decoder.frame);
          if (result2.err) {
            return {
              err: result2.err
            };
          }
          decoder.frame = result2.f;
          var pcm_buf = decoder.frame.decode();
          decoder.buf = util.concatBuffers(decoder.buf, pcm_buf);
          return {};
        };
        decoder.decode = function() {
          var result2;
          while (true) {
            result2 = decoder.readFrame();
            if (result2.err) {
              break;
            }
          }
          return decoder.buf;
        };
        decoder.ensureFrameStartsAndLength = function() {
          if (decoder.length !== invalidLength) {
            return {};
          }
          var pos = decoder.source.pos;
          decoder.source.rewind();
          var r2 = decoder.source.skipTags();
          if (r2.err) {
            return {
              err: r2.err
            };
          }
          var l = 0;
          while (true) {
            var result2 = Frameheader.read(decoder.source, decoder.source.pos);
            if (result2.err) {
              if (result2.err.toString().indexOf("UnexpectedEOF") > -1) {
                break;
              }
              return {
                err: result2.err
              };
            }
            decoder.frameStarts.push(result2.position);
            l += consts.BytesPerFrame;
            result2 = decoder.source.readFull(result2.h.frameSize() - 4);
            if (result2.err) {
              break;
            }
          }
          decoder.length = l;
          var result2 = decoder.source.seek(pos);
          if (result2.err) {
            return result2;
          }
          return {};
        };
        var r = s.skipTags();
        if (r && r.err) {
          return null;
        }
        var result = decoder.readFrame();
        if (result.err) {
          return null;
        }
        decoder.sampleRate = decoder.frame.samplingFrequency();
        result = decoder.ensureFrameStartsAndLength();
        if (result.err) {
          return null;
        }
        return decoder;
      }
    };
    module2.exports = Mp32;
  }
});

// node_modules/js-mp3/index.js
var require_js_mp3 = __commonJS({
  "node_modules/js-mp3/index.js"(exports2, module2) {
    init_globals();
    var Mp32 = require_decode();
    module2.exports = Mp32;
  }
});

// src/analysis.js
var analysis_exports = {};
__export(analysis_exports, {
  analyzeAudio: () => analyzeAudio
});
module.exports = __toCommonJS(analysis_exports);
init_globals();
var import_music_tempo = __toESM(require_MusicTempo());
var import_js_mp3 = __toESM(require_js_mp3());
var import_frame = __toESM(require_frame());
function decodeWav(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
  if (riff !== "RIFF" || wave !== "WAVE") throw new Error("Arquivo n\xE3o \xE9 um WAV v\xE1lido");
  let offset = 12;
  let audioFormat, numChannels, sampleRate, bitsPerSample, dataOffset, dataSize;
  while (offset < arrayBuffer.byteLength - 8) {
    const chunkId = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );
    const chunkSize = view.getUint32(offset + 4, true);
    if (chunkId === "fmt ") {
      audioFormat = view.getUint16(offset + 8, true);
      numChannels = view.getUint16(offset + 10, true);
      sampleRate = view.getUint32(offset + 12, true);
      bitsPerSample = view.getUint16(offset + 22, true);
    } else if (chunkId === "data") {
      dataOffset = offset + 8;
      dataSize = chunkSize;
      break;
    }
    offset += 8 + chunkSize;
    if (chunkSize % 2 !== 0) offset++;
  }
  if (!sampleRate || !dataOffset) throw new Error("WAV sem chunks fmt/data v\xE1lidos");
  const numSamples = Math.floor(dataSize / (numChannels * bitsPerSample / 8));
  const mono = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    let sum = 0;
    for (let c = 0; c < numChannels; c++) {
      const byteOffset = dataOffset + (i * numChannels + c) * (bitsPerSample / 8);
      let sample = 0;
      if (audioFormat === 3 && bitsPerSample === 32) {
        sample = view.getFloat32(byteOffset, true);
      } else if (bitsPerSample === 16) {
        sample = view.getInt16(byteOffset, true) / 32768;
      } else if (bitsPerSample === 24) {
        const b0 = view.getUint8(byteOffset);
        const b1 = view.getUint8(byteOffset + 1);
        const b2 = view.getUint8(byteOffset + 2);
        let val = b2 << 16 | b1 << 8 | b0;
        if (val & 8388608) val |= ~16777215;
        sample = val / 8388608;
      } else if (bitsPerSample === 8) {
        sample = (view.getUint8(byteOffset) - 128) / 128;
      }
      sum += sample;
    }
    mono[i] = sum / numChannels;
  }
  return { mono, sampleRate };
}
var TARGET_SR = 44100;
function resample(mono, srcRate) {
  if (srcRate === TARGET_SR) return mono;
  const ratio = srcRate / TARGET_SR;
  const outLen = Math.floor(mono.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const a = mono[idx] ?? 0;
    const b = mono[idx + 1] ?? 0;
    out[i] = a + frac * (b - a);
  }
  return out;
}
function decodeMp3(arrayBuffer) {
  const decoder = import_js_mp3.default.newDecoder(arrayBuffer);
  if (!decoder) throw new Error("MP3 inv\xE1lido ou formato n\xE3o suportado");
  const nch = decoder.frame.header.numberOfChannels();
  const sampleRate = decoder.sampleRate;
  const totalFrames = decoder.frameStarts.length;
  const SAMPLES_PER_FRAME = 1152;
  const FRAME_STEP = 2;
  const mono = new Float32Array(Math.ceil(totalFrames * SAMPLES_PER_FRAME / FRAME_STEP));
  let writePos = 0;
  function storeFrame(frame) {
    const pcmBytes = frame.decode();
    const view = new DataView(pcmBytes.buffer, pcmBytes.byteOffset, pcmBytes.byteLength);
    const n = pcmBytes.byteLength / (nch * 2);
    for (let i = 0; i < n; i += FRAME_STEP) {
      let sum = 0;
      for (let c = 0; c < nch; c++) sum += view.getInt16((i * nch + c) * 2, true) / 32768;
      mono[writePos++] = sum / nch;
    }
  }
  decoder.source.seek(decoder.frameStarts[0]);
  let prevFrame = null;
  while (true) {
    const result = import_frame.default.read(decoder.source, decoder.source.pos, prevFrame);
    if (result.err) break;
    prevFrame = result.f;
    storeFrame(prevFrame);
  }
  const encoderDelay = getMp3EncoderDelay(arrayBuffer);
  const JS_MP3_STARTUP = 2070;
  const delaySamples = Math.ceil((encoderDelay + JS_MP3_STARTUP) / FRAME_STEP);
  return { mono: mono.subarray(delaySamples, writePos), sampleRate: sampleRate / FRAME_STEP };
}
function getMp3EncoderDelay(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  let i = 0;
  if (data[0] === 73 && data[1] === 68 && data[2] === 51) {
    const id3Size = (data[6] & 127) << 21 | (data[7] & 127) << 14 | (data[8] & 127) << 7 | data[9] & 127;
    i = 10 + id3Size;
  }
  while (i < Math.min(data.length - 4, 32768)) {
    if (data[i] === 255 && (data[i + 1] & 224) === 224) break;
    i++;
  }
  if (i >= data.length - 4) return 1105;
  const version = data[i + 1] >> 3 & 3;
  const chanMode = data[i + 3] >> 6 & 3;
  const isMono = chanMode === 3;
  const sideInfo = version === 3 ? isMono ? 17 : 32 : isMono ? 9 : 17;
  const xOff = i + 4 + sideInfo;
  if (xOff + 120 >= data.length) return 1105;
  const tag = String.fromCharCode(data[xOff], data[xOff + 1], data[xOff + 2], data[xOff + 3]);
  if (tag !== "Xing" && tag !== "Info") return 1105;
  const flags = data[xOff + 4] << 24 | data[xOff + 5] << 16 | data[xOff + 6] << 8 | data[xOff + 7];
  let lOff = xOff + 8;
  if (flags & 1) lOff += 4;
  if (flags & 2) lOff += 4;
  if (flags & 4) lOff += 100;
  if (flags & 8) lOff += 4;
  if (lOff + 27 >= data.length) return 1105;
  const lTag = String.fromCharCode(data[lOff], data[lOff + 1], data[lOff + 2], data[lOff + 3]);
  if (lTag !== "LAME" && lTag !== "Lavc") return 1105;
  const encoderDelay = (data[lOff + 21] << 4 | data[lOff + 22] >> 4) & 4095;
  return encoderDelay > 0 ? encoderDelay : 1105;
}
function detectFormat(buffer) {
  const view = new Uint8Array(buffer, 0, 4);
  if (view[0] === 82 && view[1] === 73 && view[2] === 70 && view[3] === 70) return "wav";
  if (view[0] === 73 && view[1] === 68 && view[2] === 51) return "mp3";
  if (view[0] === 255 && (view[1] & 224) === 224) return "mp3";
  return "unknown";
}
async function analyzeAudio(input) {
  const byteLength = input.byteLength ?? input.length;
  const nativeBuffer = new ArrayBuffer(byteLength);
  const dst = new Uint8Array(nativeBuffer);
  const src = input instanceof Uint8Array ? input : new Uint8Array(input);
  dst.set(src);
  const fmt = detectFormat(nativeBuffer);
  let mono, sampleRate;
  if (fmt === "wav") {
    ({ mono, sampleRate } = decodeWav(nativeBuffer));
  } else if (fmt === "mp3") {
    ({ mono, sampleRate } = decodeMp3(nativeBuffer));
  } else {
    throw new Error("Formato de \xE1udio n\xE3o suportado (use WAV ou MP3)");
  }
  const resampled = resample(mono, sampleRate);
  const mt = new import_music_tempo.default(resampled, { sampleRate: TARGET_SR });
  const { tempo, beats } = mt;
  return { bpm: tempo, beats };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  analyzeAudio
});
