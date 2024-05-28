const { ipcRenderer, contextBridge } = require('electron');

function getCaretPosition(element) {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  }
  return null;
}

function autocomplete(inp, arr) {
  var currentFocus;
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.innerHTML;  
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;   
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");   
      this.parentNode.appendChild(a);    
      val = val.split('\n');
      for (i = 0; i < arr.length; i++) {
        val.forEach((val) => {
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            b = document.createElement("DIV");          
            b.innerHTML = arr[i].substr(0, val.length);
            b.innerHTML += arr[i].substr(val.length);          
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";          
            b.addEventListener("click", function(e) {  
                let theBody = inp.innerHTML;
                inp.innerHTML = theBody.replace(val, this.innerHTML);
                alert(val);   
                closeAllLists();            
            });
            a.appendChild(b);
          }
        });
      }
       
  });
 
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
       
        currentFocus++;
       
        addActive(x);
      } else if (e.keyCode == 38) { 
       
        currentFocus--;
       
        addActive(x);
      } else if (e.keyCode == 13) {
       
        e.preventDefault();
        if (currentFocus > -1) {
         
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
   
    if (!x) return false;
   
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
   
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
      }
  }
  function closeAllLists(elmnt) {
   
  var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
    }
  }

  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}
document.addEventListener("DOMContentLoaded", function() {
  contextBridge.exposeInMainWorld('archive', {
    sendContentToMain: (content) => {
      content = content.replace('<div>', '');
      content = content.replace('</div>', '');
      ipcRenderer.send('content-to-save', content);
    }
  });
  let editor = document.getElementById('text-edit');
  document.getElementById('open-button').addEventListener('click', () => {
    ipcRenderer.send('content-to-open');
  });
  document.getElementById('close').addEventListener('click', () => {
    ipcRenderer.send('close');
  });
  document.getElementById('minimize').addEventListener('click', () => {
    ipcRenderer.send('minimize');
  });
  document.getElementById('maximize').addEventListener('click', () => {
    ipcRenderer.send('maximize');
  });
  ipcRenderer.on('file-data', (event, data) => {
    editor.innerHTML = data;
  });
  const syntaxPatterns = {
    'drawWindow': 'atribute',
    'drawText': 'elements',
    'drawButton': 'elements',
    'width': 'atribute',
    'height': 'atribute',
    'x': 'atribute',
    'y': 'atribute',
    'color': 'atribute',
    'background-color': 'atribute'
  };

  let content = editor.innerHTML;

  editor.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      document.execCommand('insertLineBreak');
      e.preventDefault();
    }
  });
  

  autocomplete(editor, ["drawWindow", "drawText", "darwButton", "drawCheckBox", "drawRadios", "x", "y", "width", "height", "<html>", "<body>"]);

  Object.keys(syntaxPatterns).forEach((pattern) => {
    const regex = new RegExp(`\\b\\${pattern}\\b`, 'g');
    console.log(pattern);
    content = content.replace(regex, `<span class="${syntaxPatterns[pattern]}">${pattern}</span>`);
  });
  let textIndex = getCaretPosition(editor);
  editor.innerHTML = content;
  editor.focus();
});