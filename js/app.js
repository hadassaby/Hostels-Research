
  var wrapper = document.getElementById("signature-pad");
  var clearButton = wrapper.querySelector("[data-action=clear]");
  // var savePNGButton = wrapper.querySelector("[data-action=save-png]");
  var saveSVGButton = wrapper.querySelector("[data-action=save-svg]");
  var canvas = wrapper.querySelector("canvas");

  var signatureDate = document.getElementById("signatureDate");
  var signatureName = document.getElementById("signatureName");
  var signature = document.getElementById("signature");

  var signature_year = document.getElementById("signature_year");
  var signature_month = document.getElementById("signature_month");
  var signature_day = document.getElementById("signature_day");
  var signature_hour = document.getElementById("signature_hour");
  var signature_minute = document.getElementById("signature_minute");

  var submitButton = document.getElementById("submitButton");

  var signaturePad = new SignaturePad(canvas);

//var signaturePad = new SignaturePad(canvas, {
  // It's Necessary to use an opaque color when saving image as JPEG;
  // this option can be omitted if only saving as PNG or SVG
//  backgroundColor: 'rgb(255, 255, 255)'
//});

// Adjust canvas coordinate space taking into account pixel ratio,
// to make it look crisp on mobile devices.
// This also causes canvas to be cleared.
  function resizeCanvas() {
    if (signaturePad.isEmpty() == false)
    {
      return;
    }

    // When zoomed out to less than 100%, for some very strange reason,
    // some browsers report devicePixelRatio as less than 1
    // and only part of the canvas is cleared then.
    var ratio =  Math.max(window.devicePixelRatio || 1, 1);

    // This part causes the canvas to be cleared
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);

    // This library does not listen for canvas changes, so after the canvas is automatically
    // cleared by the browser, SignaturePad#isEmpty might still return false, even though the
    // canvas looks empty, because the internal data of this library wasn't cleared. To make sure
    // that the state of this library is consistent with visual state of the canvas, you
    // have to clear it manually.
    signaturePad.clear();
  }

  // On mobile devices it might make more sense to listen to orientation change,
  // rather than window resize events.
  window.onresize = resizeCanvas;
  resizeCanvas();

  function download(dataURL, filename) {
    if (navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") === -1) {
      window.open(dataURL);
    } else {
      var blob = dataURLToBlob(dataURL);
      var url = window.URL.createObjectURL(blob);

      var a = document.createElement("a");
      a.style = "display: none";
      a.href = url;
      a.download = filename;

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
    }
  }

  // One could simply use Canvas#toBlob method instead, but it's just to show
  // that it can be done using result of SignaturePad#toDataURL.
  function dataURLToBlob(dataURL) {
    // Code taken from https://github.com/ebidel/filer.js
    var parts = dataURL.split(';base64,');
    var contentType = parts[0].split(":")[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;
    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }

  clearButton.addEventListener("click", function (event) {
    signaturePad.clear();
  });

  saveSVGButton.addEventListener("click", saveSignature);

  submitButton.addEventListener("click", submitForm);

  function saveSignature(event) {
    if (signaturePad.isEmpty()) {
      alert("נא לחתום במסגרת לפני שמירה");
    } else {
      var dataURL = signaturePad.toDataURL('image/svg+xml');
  
      // update signature date value and make it readonly
      signatureDate.contentEditable = true;
      signature_year.contentEditable = true;
      signature_month.contentEditable = true;
      signature_day.contentEditable = true;
      signature_hour.contentEditable = true;
      signature_minute.contentEditable = true;

      var d = new Date();
      var dateTimeLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      var dateTimeLocalValue = (dateTimeLocal.toISOString()).slice(0, -1);
      signatureDate.value = dateTimeLocalValue;

      signature_year.value = d.getFullYear();
      signature_month.value = d.getMonth();
      signature_day.value = d.getDate();
      signature_hour.value = d.getHours();
      signature_minute.value = d.getMinutes();
      
      signatureDate.contentEditable = false;
      signature_year.contentEditable = false;
      signature_month.contentEditable = false;
      signature_day.contentEditable = false;
      signature_hour.contentEditable = false;
      signature_minute.contentEditable = false;

      // set signature location value
      signature.contentEditable = true;
      signature.value = dataURL;
      signature.contentEditable = false;
      // download(dataURL, "signature.png");
    }
  }

  function validateForm() {
    if (!signatureData.value)
    {
      alert("נא לחתום במסגרת ולשמור לפני שליחה");
      return false;
    }
    return true;
  }
  
  function submitForm(event) {
    var doc = new jsPDF();          
    var elementHandler = {
      '#ignorePDF': function (element, renderer) {
        return true;
      }
    };
    var source = window.document.getElementsByTagName("body")[0];
    doc.fromHTML(
        source,
        15,
        15,
        {
          'width': 180,'elementHandlers': elementHandler
        });
    
    doc.save("agreement.pdf");
  }
