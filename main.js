function cover() {
    chart = "";
    notes = [];
    taps = [];
    holds = [];
    drags = [];
    baseBpm = 0;
    bpms = 0;
    var bpmIndex = 0;
    var affText = ["AudioOffset:0", "-"];
    var lastRoad = 3;
    var reader = new FileReader();
    reader.onload = function() {
        chart = JSON.parse(JSON.parse(this.result).m_Script);
        baseBpm = chart.bPM.toFixed(2);
        bpms = chart.bpmShifts;
        var bpm = baseBpm * bpms[bpmIndex].value;
        var cumTick = 0;
        affText.push(`timing(0,${baseBpm},4.00);`);
        bpmNum.value = bpm;
        for (var i = 0; i < chart.lines.length; i++) {
            if (chart.lines[i].notes.length != 0){
                for (var j = 0; j < chart.lines[i].notes.length; j++) {
                    var note = chart.lines[i].notes[j];
                    notes.push({ time: note.time, note: note });
                }
            }
        }
        notes.sort((a, b) => a.time - b.time);
        notes.forEach(arr => {
            var note = arr.note;
            var type = note.type;
            while(true) {
                if (bpmIndex != bpms.length - 1) {
                    if (note.time >= bpms[bpmIndex + 1].time) {
                        cumTick += (bpms[bpmIndex + 1].time - bpms[bpmIndex].time) * (60 / bpm) * 1000;
                        bpmIndex++;
                        bpm = baseBpm * bpms[bpmIndex].value;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
            console.log(cumTick, note.time, bpms[bpmIndex].time, bpm);
            var tick = parseInt(cumTick + ((note.time - bpms[bpmIndex].time) * (60 / bpm) * 1000));
            if (note.type == 0) {
                if (taps[tick] == undefined) {
                    taps[tick] = [tick, 1];
                } else {
                    taps[tick][1] += 1;
                }
            } else if (note.type == 1) {
                drags[tick] = tick;
            } else if (note.type == 2) {
                var holdTime = parseInt(cumTick + ((note.otherInformations[0] - bpms[bpmIndex].time) * (60 / bpm) * 1000));
                if (note.otherInformations[0] - note.time < 0.5) {
                    if (taps[tick] == undefined) {
                        taps[tick] = [tick, 1];
                    } else {
                        taps[tick][1] += 1;
                    }
                } else {
                    if (holds[tick] == undefined) {
                        holds[tick] = [];
                    }
                    holds[tick].push([tick, holdTime]);
                }
            }
        })
        
        taps.forEach(arr => {
            if (lastRoad > 2) {
                if (arr[1] != 1) {
                    lastRoad = 2;
                    affText.push(`(${arr[0]},1);`);
                } else {
                    lastRoad = parseInt(Math.random() * (3 - 1) + 1);
                    if (lastRoad > 2) {
                        lastRoad = 2;
                    }
                }
            } else {
                if (arr[1] != 1) {
                    lastRoad = 4;
                    affText.push(`(${arr[0]},3);`);
                } else {
                    lastRoad = parseInt(Math.random() * (5 - 3) + 3);
                    if (lastRoad > 4) {
                        lastRoad = 4;
                    }
                }
            }
            affText.push(`(${arr[0]},${lastRoad});`);
        });
        drags.forEach(tick => {
            affText.push(`arc(${tick},${tick + 1},-1.00,-1.00,s,0.00,0.00,0,none,true)[arctap(${tick})];`);
        });
        holds.forEach(arr => {
            if (lastRoad > 2) {
                if (arr.length != 1) {
                    lastRoad = 2;
                    affText.push(`hold(${arr[1][0]},${arr[1][1]},1);`);
                } else {
                    lastRoad = parseInt(Math.random() * (3 - 1) + 1);
                    if (lastRoad > 2) {
                        lastRoad = 2;
                    }
                }
            } else {
                if (arr.length != 1) {
                    lastRoad = 4;
                    affText.push(`hold(${arr[1][0]},${arr[1][1]},3);`);
                } else {
                    lastRoad = parseInt(Math.random() * (5 - 3) + 3);
                    if (lastRoad > 4) {
                        lastRoad = 4;
                    }
                }
            }
            affText.push(`hold(${arr[0][0]},${arr[0][1]},${lastRoad});`);
        });
        document.body.querySelector(".preview").value = affText.join("\n");
    }
    reader.readAsText(input.files[0]);
}

var input = document.querySelector(".upload");
var bpmNum = document.querySelector(".bpm");
var texts = [];
var ttml = [];
var meta = [];
var chart = "";
var notes = [];
var taps = [];
var holds = [];
var drags = [];
var baseBpm = 0;
var bpms = [];

input.addEventListener("change", function(event) {
    cover();
});