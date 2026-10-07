/*Code by android developers start here*/
var startLoc = null;
//var contentName = '152';
//step 1:-
var contentName = parseInt(localStorage.getItem("currentbrand"));
var currentContentId = parseInt(localStorage.getItem("currentcontent"));

// ========================================
// SECTION BASED NAVIGATION
// ========================================

// ========================================
// SECTION CONFIGURATION
// ========================================

const sections = {
  introduction: {
    id: "introduction",
    name: "Introduction",
    slides: [1, 2, 3, 4],
    isCommon: true,
  },

  brandCommunication: {
    id: "brandCommunication",
    name: "Brand Communication",
    slides: [5, 6, 7],
  },

  videosAnimation: {
    id: "videosAnimation",
    name: "Videos & Animation",
    slides: [8, 9, 10, 11, 12, 13, 14, 15, 16],
  },

  personalizedVideo: {
    id: "personalizedVideo",
    name: "Personalized Video",
    slides: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
  },

  rxpl: {
    id: "rxpl",
    name: "RxPL",
    slides: [30, 31],
  },

  websites: {
    id: "websites",
    name: "Websites",
    slides: [32, 33],
  },

  qrGeneration: {
    id: "qrGeneration",
    name: "QR Generation",
    slides: [34, 35, 36, 37, 38, 39, 40],
  },

  games: {
    id: "games",
    name: "Games",
    slides: [41, 42, 43, 44],
  },

  extraSection: {
    id: "extraSection",
    name: "Extra PPT Section",
    slides: [99],
  },
  productAdvertisement: {
    id: "productAdvertisement",
    name: "Product Advertisement",
    slides: [100],
  },
  fieldMotivation: {
    id: "fieldMotivation",
    name: "Field Motivation",
    slides: [101],
  },
  docTalk: {
    id: "docTalk",
    name: "DocTalk",
    slides: [102],
  },
  docTalkShow: {
    id: "docTalkShow",
    name: "DocTalk Show",
    slides: [103],
  },
  docTalkQuiz: {
    id: "docTalkQuiz",
    name: "DocTalkQuiz",
    slides: [104],
  },
};

function normalizeRequest(request) {
  if (typeof request === "string") {
    return [request];
  }

  if (Array.isArray(request)) {
    return request;
  }

  return [];
}

function buildPresentation(config) {
  const requestedSections = config.sections || [];
  const selectedSlides = config.slides || {};

  const sectionMap = {
    intro: "introduction",
    brand: "brandCommunication",
    "extra-section": "extraSection",
    videos: "videosAnimation",
    personalized: "personalizedVideo",
    rxpl: "rxpl",
    websites: "websites",
    qr: "qrGeneration",
    games: "games",
    "product-advertisement": "productAdvertisement",
    "field-motivation": "fieldMotivation",
    "doc-talk": "docTalk",
    "doc-talk-show": "docTalkShow",
    "doc-talk-quiz": "docTalkQuiz",
  };

  const presentation = [];

  const hasIntroduction = requestedSections.includes("intro");

  // ========================================
  // INTRODUCTION
  // ========================================

  if (hasIntroduction) {
    // User selected Introduction.
    // Show selected Introduction slides.

    const introSlides = (selectedSlides.intro || [])
      .map(Number)
      .filter(function (slideId) {
        return sections.introduction.slides.includes(slideId);
      });

    presentation.push({
      sectionId: "introduction",
      slides:
        introSlides.length > 0 ? introSlides : sections.introduction.slides,
    });
  } else {
    // Introduction wasn't selected.
    // Always show only Introduction slide 1.

    presentation.push({
      sectionId: "introduction",
      slides: [sections.introduction.slides[0]],
    });
  }

  // ========================================
  // OTHER SECTIONS
  // ========================================

  requestedSections.forEach(function (requestedSection) {
    if (requestedSection === "intro") {
      return;
    }

    const sectionId = sectionMap[requestedSection];

    if (!sectionId) {
      console.warn("Unknown requested section:", requestedSection);
      return;
    }

    const availableSlides = sections[sectionId].slides;

    const requestedSlides = (selectedSlides[requestedSection] || [])
      .map(Number)
      .filter(function (slideId) {
        return availableSlides.includes(slideId);
      });

    // If section was selected but no individual
    // slides were selected, use all slides.
    const finalSlides =
      requestedSlides.length > 0 ? requestedSlides : availableSlides;

    presentation.push({
      sectionId: sectionId,
      slides: finalSlides,
    });
  });

  return presentation;
}

function trackPresentationView(config) {
  fetch("/api/url/track-view", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      companySlug: config.companySlug,
      divisionSlug: config.divisionSlug,
      usernameSlug: config.usernameSlug,
      projectSlug: config.projectSlug,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Presentation view tracked:", data);
    })
    .catch((error) => {
      console.error("Failed to track presentation view:", error);
    });
}

function loadPresentation(config) {
  trackPresentationView(config);

  presentation = buildPresentation(config);

  if (presentation.length === 0) {
    console.error("No presentation sections found");
    return;
  }

  currentPresentationIndex = 0;

  currentSection = presentation[currentPresentationIndex].sectionId;

  currentSectionSlides = presentation[currentPresentationIndex].slides;

  currentSectionIndex = 0;

  var firstSlideId = currentSectionSlides[0];

  console.log("=================================");
  console.log("Presentation loaded");
  console.log("Presentation:", presentation);
  console.log("Current section:", currentSection);
  console.log("Current slides:", currentSectionSlides);
  console.log("First slide:", firstSlideId);
  console.log("=================================");

  $("#wrapper").attr("rel", firstSlideId);

  renderSectionThumbnails();

  open_page("", firstSlideId);
}

// ========================================
// CURRENT SECTION STATE
// ========================================

var presentation = [];
var currentPresentationIndex = 0;

var currentSection = "introduction";

var currentSectionSlides = [1];

var currentSectionIndex = 0;
//ends
checkClickThrough();

document
  .getElementById("main_content")
  .addEventListener("touchmove", touchHandler, false);
document
  .getElementById("main_content")
  .addEventListener("touchstart", touchHandler, false);
function touchHandler(e) {
  if (e.type == "touchstart") {
    if (e.touches.length == 1) {
      // one finger touch
      var touch = e.touches[0];
      startLoc = { x: touch.pageX, y: touch.pageY };
    }
  } else if (e.type == "touchmove") {
    if (startLoc) {
      var touch = e.touches[0];

      if (
        Math.abs(startLoc.x - touch.pageX) > Math.abs(startLoc.y - touch.pageY)
      ) {
        e.preventDefault();
      }
      startLoc = null;
    }
  }
}
/*Code by android developers ends here*/
$(document).ready(function () {
  var ua = navigator.userAgent;
  //var event = "touchstart";
  var event = ua.match(/Ipad/i) ? "touchstart" : "click";

  $(".left_arrow").click(function (event) {
    go_nav("b");
  });

  $(".right_arrow").click(function (event) {
    go_nav("f");
  });

  $(document).on("click", ".slides", function () {
    var slideId = parseInt($(this).attr("data-page-id"));

    // Find which section contains this slide
    for (var i = 0; i < presentation.length; i++) {
      var section = presentation[i];

      var slideIndex = section.slides.indexOf(slideId);

      if (slideIndex !== -1) {
        // Move to that section
        currentPresentationIndex = i;

        currentSection = section.sectionId;

        currentSectionSlides = section.slides;

        // Move to that slide
        currentSectionIndex = slideIndex;

        console.log(
          "Thumbnail clicked:",
          "section =",
          currentSection,
          "slide =",
          slideId,
        );

        $("#wrapper").attr("rel", slideId);

        open_page("", slideId);

        updateActiveThumbnail();

        return;
      }
    }

    console.warn("Slide not found in presentation:", slideId);
  });

  $(".reference").removeClass("active");

  $(".reference").on("swipeleft swiperight", function (event) {
    event.stopPropagation();
  });

  $(".box_btn").bind("click", function () {
    $(".reference").toggleClass("active");
  });

  currentSlide();

  $("#main_content").swipe({
    swipeLeft: function (event, direction, distance, duration, fingerCount) {
      go_nav("f");
    },

    swipeRight: function (event, direction, distance, duration, fingerCount) {
      go_nav("b");
    },

    threshold: 0,
  });
});

function renderSectionThumbnails() {
  var container = $("#slide_jumper");

  container.empty();

  presentation.forEach(function (section) {
    section.slides.forEach(function (slideId) {
      var thumbnail = `
        <div
          class="slides"
          data-page-id="${slideId}"
        >
          <img
            src="thumbs/${slideId}.png"
            alt="Slide ${slideId}"
          >
        </div>
      `;

      container.append(thumbnail);
    });
  });

  updateActiveThumbnail();
}

function go_nav(direction) {
  if (!presentation || presentation.length === 0) {
    console.warn("No presentation loaded");
    return;
  }

  // ========================================
  // NEXT
  // ========================================

  if (direction === "f") {
    // ----------------------------------------
    // There is another slide in this section
    // ----------------------------------------

    if (currentSectionIndex < currentSectionSlides.length - 1) {
      currentSectionIndex++;
    }

    // ----------------------------------------
    // Current section is finished
    // Move to next section
    // ----------------------------------------
    else {
      if (currentPresentationIndex < presentation.length - 1) {
        currentPresentationIndex++;

        currentSection = presentation[currentPresentationIndex].sectionId;

        currentSectionSlides = presentation[currentPresentationIndex].slides;

        currentSectionIndex = 0;

        console.log("Moving to next section:", currentSection);

        renderSectionThumbnails();
      } else {
        console.log("Reached end of presentation");

        return;
      }
    }
  }

  // ========================================
  // PREVIOUS
  // ========================================
  else if (direction === "b") {
    // ----------------------------------------
    // There is another previous slide
    // in current section
    // ----------------------------------------

    if (currentSectionIndex > 0) {
      currentSectionIndex--;
    }

    // ----------------------------------------
    // We are at first slide of section
    // Move to previous section
    // ----------------------------------------
    else {
      if (currentPresentationIndex > 0) {
        currentPresentationIndex--;

        currentSection = presentation[currentPresentationIndex].sectionId;

        currentSectionSlides = presentation[currentPresentationIndex].slides;

        // Go to LAST slide of previous section
        currentSectionIndex = currentSectionSlides.length - 1;

        console.log("Moving to previous section:", currentSection);

        renderSectionThumbnails();
      } else {
        console.log("Reached beginning of presentation");

        return;
      }
    }
  }

  // ========================================
  // OPEN CURRENT SLIDE
  // ========================================

  var page_id = currentSectionSlides[currentSectionIndex];

  $("#wrapper").attr("rel", page_id);

  console.log("Opening section:", currentSection, "slide:", page_id);

  open_page("", page_id);

  updateActiveThumbnail();
}
// Define the function to flip the image
function flipImageFunction1() {
  const image = document.getElementById("flipImage");
  const currentSrc = image.src;

  // Change the image source
  image.src = currentSrc.includes("slide5/1.jpg")
    ? "slide5/2.jpg"
    : "slide5/1.jpg";
}

// Define the function to fade out the overlay image
// function fadeOutOverlay() {
//   const overlayImage = document.getElementById("overlayImage");

//   // Add the fade-out class to the overlay image
//   overlayImage.classList.add("fade-out");
// }

// Define the function to toggle fade-out effect

function toggleFadeOverlay() {
  const overlayImage = document.getElementById("overlayImage");
  const title4Element = document.querySelector(".title4");

  // Toggle the fade-out class
  if (overlayImage.classList.contains("fade-out")) {
    overlayImage.classList.remove("fade-out");
    title4Element.style.zIndex = "1"; // Reset z-index for title4
  } else {
    overlayImage.classList.add("fade-out");
    title4Element.style.zIndex = "0"; // Set z-index for title4 to 0
  }
}

function flipImageFunction() {
  // Select the picture2 div
  const picture2Div = document.querySelector(".picture2");

  // Toggle its visibility
  if (picture2Div.style.display === "none") {
    picture2Div.style.display = "block"; // Show the div
  } else {
    picture2Div.style.display = "none"; // Hide the div
  }
}

function set_pg_content(sectionName, slideId) {
  $(".reference").removeClass("active");

  var content = "";

  // ==========================================
  // INTRODUCTION
  // ==========================================

  if (sectionName === "introduction") {
    switch (slideId) {
      // ----------------------------------------
      // Introduction Slide 1
      // ----------------------------------------

      case 1:
        content =
          '<link rel="stylesheet" type="text/css" href="slide1/slide1.css" media="screen"/><div class="background"><img src="slide1/1.jpg" width="1024" height="768"></div>                <div class="title1" class="frameopen" onclick="framepop()"><img src="slide1/digiLogoGif.gif"/></div> <div class="disclamer" class="frameopen" onclick="framepop()"><p id="dishead"><p><span>DISCLAIMER:</span>The concepts, designs, and strategies presented in this document are proprietary and intended solely for the consideration of the recipient. All ideas, creative executions, and strategic insights remain the intellectual property of digiLATERAL and are provided for discussion purposes only. Any reproduction, distribution, or implementation of these ideas without the explicit written consent of digiLATERAL is strictly prohibited. digiLATERAL reserves the right to modify, withdraw, or pursue these concepts independently should they not be accepted within 15 days. By reviewing this presentation, the recipient acknowledges and agrees to these terms.</p></div>  ';
        break;

      // ----------------------------------------
      // Who we are
      // ----------------------------------------

      case 2:
        content =
          '<link rel="stylesheet" type="text/css" href="slide2/slide2.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Who We Are</p></div>  <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><p>We are a Pharma Brand & Digital solutions partner<br><br><br>We understand the pharma space, the HCP & brand requirements, the<br > patient journey, the digital reach in pharma industry<br><br><br>We conceptualize and develop brand & digital solutions that are<br> in-line with your brand strategy and can be effectively implemented for<br> the end user</p></div>';
        break;

      // ----------------------------------------
      // Brand & Digital Solutions for Pharma Marketeers
      // ----------------------------------------

      case 3:
        content =
          '<link rel="stylesheet" type="text/css" href="slide3/slideNew.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Brand & Digital Solutions for Pharma Marketeers</p></div>  <div class="title2" class="frameopen"><img src="slide3/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><img src="slide3/Picture1.png"></div>';
        break;

      // ----------------------------------------
      // They TRUST Us
      // ----------------------------------------

      case 4:
        content =
          '<link rel="stylesheet" type="text/css" href="slide4/SlideNew4.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>They TRUST Us</p></div>  <div class="title2" class="frameopen"><img src="slide4/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><img src="slide4/Picture1.png"></div>';
        break;
    }
  } else if (sectionName === "brandCommunication") {
    switch (slideId) {
      // ----------------------------------------
      // Brand Communication & Creatives
      // ----------------------------------------

      case 5:
        content =
          '<link rel="stylesheet" type="text/css" href="slide5/slideNew5.css" media="screen"/><div class="background"><img src="slide1/1.jpg" width="1024" height="768"></div>    <div class="title1" class="frameopen"><p>Brand Communication & Creatives</p></div> <div class="title2" class="frameopen"><img src="slide4/DigiLateral Logo.png"/></div> ';
        break;

      // ----------------------------------------
      // Brand Communication & Creatives 1
      // ----------------------------------------

      case 6:
        content = `
    <link rel="stylesheet" type="text/css" href="slide6/slideNew6.css" media="screen"/>

    <div class="background">
      <img src="slide4/Slide4Bg.jpg" width="1024" height="768">
    </div>

    <div class="title1">
      <p>Brand Communication & Creatives</p>
    </div>

    <div class="title2">
      <img src="slide4/DigiLateral Logo.png"/>
    </div>

    <div class="title3">
      <img src="slide6/Picture1.png">
    </div>

    <!-- ✅ WATERMARK -->
    <div class="watermark">DEMO PURPOSE ONLY</div>
    `;
        break;
      // ----------------------------------------
      // BBrand Communication & Creatives 2
      // ----------------------------------------

      case 7:
        content =
          '<link rel="stylesheet" type="text/css" href="slide7/slideNew7.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Brand Communication & Creatives</p></div>  <div class="title2" class="frameopen"><img src="slide4/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><img src="slide7/Picture1.png"></div>';
        break;
    }
  } else if (sectionName === "extraSection") {
    switch (slideId) {
      // ----------------------------------------
      // Extra PPT Section
      // ----------------------------------------

      case 99:
        content =
          '<link rel="stylesheet" type="text/css" href="slide99/slide99.css" media="screen"/><div class="background"><img src="slide99/1.png" width="1024" height="768"></div>';
        break;
    }
  } else if (sectionName === "videosAnimation") {
    switch (slideId) {
      // ----------------------------------------
      // Videos & Animation
      // ----------------------------------------

      case 8:
        content =
          '<link rel="stylesheet" type="text/css" href="slide8/slideNew8.css" media="screen"/><div class="background"><img src="slide1/1.jpg" width="1024" height="768"></div>    <div class="title1" class="frameopen"><p>Videos & Animation</p></div> <div class="title2" class="frameopen"><img src="slide4/DigiLateral Logo.png"/></div> ';
        break;

      // ----------------------------------------
      // Video Shoots
      // ----------------------------------------

      case 9:
        content =
          '<link rel="stylesheet" type="text/css" href="slide9/slideNew9.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Video Shoots</p></div>  <div class="title2" class="frameopen"><img src="slide4/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><video src="slide9/video1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div>';
        break;

      // ----------------------------------------
      // Product Quality Videos
      // ----------------------------------------

      case 10:
        content =
          '<link rel="stylesheet" type="text/css" href="slide9/slideNew9.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Product Quality Videos</p></div>  <div class="title2" class="frameopen"><img src="slide4/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><video src="slide11/video1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div>';
        break;

      // ----------------------------------------
      // Product Learning
      // ----------------------------------------

      case 11:
        content =
          '<link rel="stylesheet" type="text/css" href="slide9/slideNew9.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Product Learning</p></div>  <div class="title2" class="frameopen"><img src="slide4/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><video src="slide12/video1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div>';
        break;

      // ----------------------------------------
      // Drug Technology
      // ----------------------------------------

      case 12:
        content =
          '<link rel="stylesheet" type="text/css" href="slide9/slideNew9.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Drug Technology</p></div>  <div class="title2" class="frameopen"><img src="slide4/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><video src="slide13/video1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div>';
        break;

      // ----------------------------------------
      // Annual Theme Videos
      // ----------------------------------------
      case 13:
        content =
          '<link rel="stylesheet" type="text/css" href="slide9/slideNew9.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Annual Theme Videos</p></div>  <div class="title2" class="frameopen"><img src="slide4/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><video src="slide14/video1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div>';
        break;

      // ----------------------------------------
      // Sales Motivation
      // ----------------------------------------

      case 14:
        content =
          '<link rel="stylesheet" type="text/css" href="slide9/slideNew9.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Sales Motivation</p></div>  <div class="title2" class="frameopen"><img src="slide4/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><video src="slide15/video1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div>';
        break;

      // ----------------------------------------
      // Hum Mein Hai HEro -Humimab Hc
      // ----------------------------------------

      case 15:
        content =
          '<link rel="stylesheet" type="text/css" href="slide21/slide21.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Sales Motivation</p></div>  <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><video src="slide21/1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div>';
        break;

      // ----------------------------------------
      // Hum Mein Hai HEro -Humimab Hc
      // ----------------------------------------

      case 16:
        content =
          '<link rel="stylesheet" type="text/css" href="slide22/slide22.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Sales Motivation</p></div>  <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><video src="slide22/1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div>';
        break;
    }
  } else if (sectionName === "personalizedVideo") {
    switch (slideId) {
      // ----------------------------------------
      // Personalization Video Creation
      // ----------------------------------------

      case 17:
        content =
          '<link rel="stylesheet" type="text/css" href="slide14/slide14.css" media="screen"/><div class="background"><img src="slide1/1.jpg" width="1024" height="768"></div>    <div class="title1" class="frameopen"><p>Personalized Video Creation</p></div> <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> ';
        break;

      // ----------------------------------------
      // Mothers Day Activity
      // ----------------------------------------

      case 18:
        content = `<link rel="stylesheet" type="text/css" href="slide32/slide32.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Mothers Day Activity</p></div>  <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><video src="slide32/mothers.mp4" width="200" height="210" controls controlslist="nodownload"></video><p class="subHead">Mothers Day Activity</p></div>`;
        break;

      // ----------------------------------------
      // Picture in Video
      // ----------------------------------------

      case 19:
        content =
          '<link rel="stylesheet" type="text/css" href="slide3/slide3.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Picture in Video (PiV)</p></div>  <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><video src="slide3/1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title4" class="frameopen"><p class="para"><span class="highlight">Example 1: Doctor’s Day</span><br><br>In association with the client we create the video template<br><br>The entire video is then coded by our programmers and uploaded on iCreate portal <br><br> A module is created for MR’s to access, create and download the videos</p></div>';
        break;

      // ----------------------------------------
      // Picture in Video
      // ----------------------------------------

      case 20:
        content =
          '<link rel="stylesheet" type="text/css" href="slide4/slide4.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Picture in Video (PiV)</p></div>  <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><p>Example 2: Birthday</p><video src="slide4/1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title4" class="frameopen"><p>Example 3: Teachers Day</p><video src="slide4/2.mp4" width="400" height="610" controls controlslist="nodownload"></video></div>';
        break;

      // ----------------------------------------
      // Picture in Video
      // ----------------------------------------

      case 21:
        content =
          '<link rel="stylesheet" type="text/css" href="slide5/slide5.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Picture in Video (PiV)</p></div>  <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><p>Example 4: Doctors Hospital/Nursing Home Advt </p><video src="slide5/1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title4" class="frameopen"><video src="slide5/2.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title5" class="frameopen"><p>Example 5: Video Reels on Disease Awareness </p></div>';
        break;

      // ----------------------------------------
      // Video IN Video
      // ----------------------------------------

      case 22:
        content =
          '<link rel="stylesheet" type="text/css" href="slide6/slide6.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Picture in Video (PiV)</p></div>  <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><p>Example 6: Social Media Posts</p><video src="slide6/1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title4" class="frameopen"><video src="slide6/2.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title5" class="frameopen"><p></p></div>';
        break;

      // ----------------------------------------
      // Video in Video
      // ----------------------------------------

      case 23:
        content =
          '<link rel="stylesheet" type="text/css" href="slide7/slide7.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Video in Video (ViV)</p></div><div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div><div class="title6" class="frameopen"><p>Background video + Template + Overlay video</p></div> <div class="title7" class="frameopen"><p>Example: Yoga Day</p></div> <div class="container"><div class="title3" class="frameopen"><p>Background video</p><video src="slide7/1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title5" class="frameopen"><p>Template Design</p><img src="slide7/2.png" width="400" height="610""></div><div class="title4" class="frameopen"><p>Overlay video</p><video src="slide7/3.mp4" width="400" height="610" controls controlslist="nodownload"></video></div></div>';
        break;

      // ----------------------------------------
      // Video in Video
      // ----------------------------------------

      case 24:
        content =
          '<link rel="stylesheet" type="text/css" href="slide8/slide8.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Final Video</p></div><div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div><div class="title3" class="frameopen"><video src="slide8/1.mp4" width="1024" height="768" controls controlslist="nodownload"></video></div>';
        break;

      // ----------------------------------------
      // Video in Video
      // ----------------------------------------

      case 25:
        content =
          '<link rel="stylesheet" type="text/css" href="slide9/slide9.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Video in Video (ViV)</p></div><div class="title5" class="frameopen"><p>Background Template + Overlay Elements+ Recorded Video</p></div><div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><p>Example: Custom Videos / Video Reels (Full Scale)</p><video src="slide9/1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title4" class="frameopen"><video src="slide9/2.mp4" width="400" height="610" controls controlslist="nodownload"></video></div>';
        break;

      // ----------------------------------------
      // Health Living
      // ----------------------------------------

      case 26:
        content =
          '<link rel="stylesheet" type="text/css" href="slide10/slide10.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Video in Video (ViV)</p></div><div class="title5" class="frameopen"><p>Background Template + Overlay Elements+ Recorded Video</p></div><div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><p>Example: Custom Videos / Video Reels</p><video src="slide10/1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title4" class="frameopen"><video src="slide10/2.mp4" width="400" height="610" controls controlslist="nodownload"></video></div>';
        break;

      case 27:
        content =
          '<link rel="stylesheet" type="text/css" href="slide11/slide11.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Video in Video (ViV)</p></div><div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div><div class="title6" class="frameopen"><p>Background  Video Template + Recorded Video + Audio Filter + Recorded Video Background Removal</p></div><div class="container"><div class="title3" class="frameopen"><p>Background Video Template</p><video src="slide11/1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title5" class="frameopen"><p>Video Recorded by MR</p><video src="slide11/2.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title4" class="frameopen"><p>Audio Filtered by iCreate</p><video src="slide11/3.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title8" class="frameopen"><img src="slide11/Arrow.png" width="400" height="610"></div><div class="title7" class="frameopen"><video src="slide11/4.mp4" width="400" height="610" controls controlslist="nodownload"></video></div></div>';
        break;

      case 28:
        content =
          '<link rel="stylesheet" type="text/css" href="slide33/slide33.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Video in Video (ViV)</p></div><div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div><div class="title6" class="frameopen"><p>Audio Filter + Background Removal/Replacement + Light Effects – Skin Glow</p></div><div class="container"><div class="title3" class="frameopen"><video src="slide33/media1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title5" class="frameopen"><video src="slide33/Media2.mp4" width="250" height="610" controls controlslist="nodownload"></video>';
        break;

      case 29:
        content =
          '<link rel="stylesheet" type="text/css" href="slide13/slide13.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Video in Video (ViV)</p></div><div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div><div class="title6" class="frameopen"><p>Multiple Videos in a Video</p></div><div class="container"><div class="title3" class="frameopen"><p>Base Video</p><video src="slide13/1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title5" class="frameopen"><p>Overlay 1</p><video src="slide13/2.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title4" class="frameopen"><p>Overlay 2</p><video src="slide13/3.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title9" class="frameopen"><p>Overlay 3</p><video src="slide13/4.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title8" class="frameopen"><img src="slide13/Arrow.png" width="400" height="610"></div><div class="title7" class="frameopen"><p>Final Output</p><video src="slide13/5.mp4" width="400" height="610" controls controlslist="nodownload"></video></div></div>';
        break;
    }
  } else if (sectionName === "rxpl") {
    switch (slideId) {
      case 30:
        content =
          '<link rel="stylesheet" type="text/css" href="slide14/slide14.css" media="screen"/><div class="background"><img src="slide1/1.jpg" width="1024" height="768"></div>    <div class="title1" class="frameopen"><p>RxPL</p></div> <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> ';
        break;

      case 31:
        content =
          '<link rel="stylesheet" type="text/css" href="slide15/slide15.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>RxPL</p></div>  <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><video src="slide15/1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title4" class="frameopen"><p class="para"><span class="highlight">RxPL App</span><br><br>The app gamifies sales performance by letting teams score runs for every prescription and compete in cricket-style matches or tournaments.<br><br>It fosters healthy competition, engagement, and motivation among the sales teams.<br><br> A fun and dynamic way to track performance while driving brand growth.<br><br><br></p></div>';
        break;
    }
  } else if (sectionName === "websites") {
    switch (slideId) {
      case 32:
        content =
          '<link rel="stylesheet" type="text/css" href="slide14/slide14.css" media="screen"/><div class="background"><img src="slide1/1.jpg" width="1024" height="768"></div>    <div class="title1" class="frameopen"><p>Websites</p></div> <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> ';
        break;

      case 33:
        content =
          '<link rel="stylesheet" type="text/css" href="slide34/slide34.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Websites</p></div><div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div><div class="img1"><img src="slide34/Picture1.png" width="1024" height="768"></div><div class="img2"><img src="slide34/Picture2.png" width="1024" height="768"></div><div class="img3"><img src="slide34/Picture3.png" width="1024" height="768"></div>';
        break;
    }
  } else if (sectionName === "qrGeneration") {
    switch (slideId) {
      case 34:
        content =
          '<link rel="stylesheet" type="text/css" href="slide16/slide16.css" media="screen"/><div class="background"><img src="slide1/1.jpg" width="1024" height="768"></div> <div class="title1" class="frameopen"><p>QwiQly – QR Generation Portal</p></div> <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div>';
        break;

      case 35:
        content =
          '<link rel="stylesheet" type="text/css" href="slide31/slide31.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Digital Business Card</p></div>  <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><img src="slide31/1.png" width="400" height="610""></div><div class="title5" class="frameopen"><img src="slide31/2.png" width="400" height="610"></div><div class="title4" class="frameopen"><p class="para"><span class="highlight"></span><br><br><span class="highlight">1. Smart Networking:</span> Share your contact details instantly via QR codes or links—no more paper cards.<br><br><span class="highlight">2. Customizable Design: </span>Reflect your brand’s identity with sleek, personalized digital cards.<br><br><span class="highlight"> 3. Eco-Friendly & Cost-Effective:</span> Eliminate printing costs while contributing to a sustainable future.<br><br><span class="highlight"> 4. Analytics & Insights:</span>Track engagement and maximize your networking impact.</p></div>';
        break;

      case 36:
        content =
          '<link rel="stylesheet" type="text/css" href="slide17/slide17.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Assignable QR Code</p></div>  <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><img src="slide17/QR.jpg" width="400" height="610"></div><div class="title4" class="frameopen"><p class="para"><span class="highlight">Assign QR Post Allocation</span></p><br><br><ul class="bullet-list"><li>Create QR Codes in Bulk</li><li>Allocate to your teams</li><li>Teams can randomly assign to Doctors</li><li>Once a QR code is assigned to the Doctor, it cannot be changed</li><li>The doctor can further add patient information visit-wise</li></ul></div>';
        break;

      case 37:
        content =
          '<link rel="stylesheet" type="text/css" href="slide35/slide35.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Assignable QR Code</p></div>  <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><img src="slide35/QR.jpg" width="400" height="610"></div><div class="title4" class="frameopen"><p class="subtitle">Assignable QR code System</p><p class="highlight">USE CASES</p><div><div class="ulTag"><p class="ulHeading">Patient Prescription Tracker:</p></div><ul class="bullet-list"><li>A doctor assigns a QR code to a patient, linking it to their prescription or follow-up schedule.</li><li>On the first scan, the doctor assigns the patient’s prescription details or educational materials.</li><li>On subsequent scans, the patient directly accesses their personalized treatment plan or medication reminders.</li></ul></div>    <div class="ulTag1"><p class="ulHeading1">Post-Surgery or Post-Treatment Care Guide</p></div><ul class="bullet-list1"><li>A doctor assigns a QR code with recovery guidelines for surgery or treatment</li><li>First scan lets the doctor attach rehab exercises, dietary advice, or precautions.</li><li>Subsequent scans take the patient to their personalized recovery plan</li></ul> <div class="ulTag2"><p class="ulHeading2">Medication Compliance Tracker:</p></div><ul class="bullet-list2"><li>A QR code is assigned to a patient’s medication regimen.</li><li>Scanning leads to a medication tracker, dosing schedule, and reminders.</li></ul></div></div> </div></div>';
        break;

      case 38:
        content =
          '<link rel="stylesheet" type="text/css" href="slide36/slide36.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Assignable QR Code</p></div><div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div><div class="img1"><img src="slide36/Picture4.png" width="1024" height="768"></div><div class="img2"><img src="slide36/Picture5.png" width="1024" height="768"></div>';
        break;

      case 39:
        content =
          '<link rel="stylesheet" type="text/css" href="slide37/slide37.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Picture/GIF QR Codes</p></div>  <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> <div class="img1"><img src="slide37/Picture6.png" width="1024" height="768"></div><div class="img2"><img src="slide37/Picture10.gif" width="1024" height="768"></div><div class="img3"><img src="slide37/Picture8.png" width="1024" height="768"></div><div class="img4"><img src="slide37/Picture9.png" width="1024" height="768"></div>  <div class="title4" class="frameopen"><p class="para"><br><br>QR codes come with a colour photo or GIF in the background, making them visually engaging and interactive.<br><br>Scanning the QR code reveals dynamic content, enhancing the user experience with rich media.<br><br> A creative and impactful way to attract attention and drive engagement for brand</p></div>';
        break;

      case 40:
        content =
          '<link rel="stylesheet" type="text/css" href="slide38/slide38.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Retail Chemist Activities</p></div>  <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> <div class="img1"><img src="slide38/Picture11.png" width="1024" height="768"></div><div class="img2"><img src="slide38/Picture12.png" width="1024" height="768"></div> <div class="title4"><h1>Chemist Activity - Schemes</h1></div>  <div class="title4" class="frameopen"><p class="para"><br><br>A single poster with a DYNAMIC QR code placed at chemist locations enables instant access to SUMO offers.<br><br>Chemists can scan the code to stay updated on exclusive deals and benefits.<br><br> A convenient and efficient way to enhance engagement and drive sales at the point of purchase.</p></div>';
        break;
    }
  } else if (sectionName === "productAdvertisement") {
    switch (slideId) {
      case 100:
        content =
          '<link rel="stylesheet" type="text/css" href="slide100/slide100.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Product Advertisement</p></div><div class="title2" class="frameopen"><img src="slide4/DigiLateral Logo.png"/></div><div class="title3" class="frameopen"><video src="slide100/video.mp4" width="800" height="auto" controls controlslist="nodownload"></video></div>';
        break;
    }
  } else if (sectionName === "fieldMotivation") {
    switch (slideId) {
      case 101:
        content =
          '<link rel="stylesheet" type="text/css" href="slide101/slide101.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Field Motivation</p></div><div class="title2" class="frameopen"><img src="slide4/DigiLateral Logo.png"/></div><div class="title3" class="frameopen"><video src="slide101/video.mp4" width="800" height="auto" controls controlslist="nodownload"></video></div>';
        break;
    }
  } else if (sectionName === "docTalk") {
    switch (slideId) {
      case 102:
        content =
          '<link rel="stylesheet" type="text/css" href="slide102/slide102.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>DocTalk</p></div><div class="title2" class="frameopen"><img src="slide4/DigiLateral Logo.png"/></div><div class="title3" class="frameopen"><video src="slide102/video.mp4" width="800" height="450" controls controlslist="nodownload"></video></div>';
        break;
    }
  } else if (sectionName === "docTalkShow") {
    switch (slideId) {
      case 103:
        content =
          '<link rel="stylesheet" type="text/css" href="slide103/slide103.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>DocTalk Show</p></div><div class="title2" class="frameopen"><img src="slide4/DigiLateral Logo.png"/></div><div class="title3" class="frameopen"><video src="slide103/video.mp4" width="800" height="450" controls controlslist="nodownload"></video></div>';
        break;
    }
  } else if (sectionName === "docTalkQuiz") {
    switch (slideId) {
      case 104:
        content =
          '<link rel="stylesheet" type="text/css" href="slide104/slide104.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>DocTalkQuiz</p></div><div class="title2" class="frameopen"><img src="slide4/DigiLateral Logo.png"/></div><div class="title3" class="frameopen"><video src="slide104/video.mp4" width="800" height="450" controls controlslist="nodownload"></video></div>';
        break;
    }
  } else if (sectionName === "games") {
    switch (slideId) {
      case 41:
        content =
          '<link rel="stylesheet" type="text/css" href="slide24/slide24.css" media="screen"/><div class="background"><img src="slide1/1.jpg" width="1024" height="768"></div> <div class="title1" class="frameopen"><p>Games</p></div> <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div>';
        break;

      case 42:
        content =
          '<link rel="stylesheet" type="text/css" href="slide25/slide25.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Find the Path</p></div><div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div><div class="title6" class="frameopen"><p></p></div><div class="container"><div class="title3" class="frameopen"><img src="slide25/1.gif" width="400" height="610"></div><div class="title5" class="frameopen"><img src="slide25/2.png" width="400" height="610"></div><div class="title4" class="frameopen"><img src="slide25/3.png" width="400" height="610"></div><div class="title7" class="frameopen"><video src="slide25/4.mp4" width="400" height="610" controls controlslist="nodownload"></video></div></div>';
        break;

      case 43:
        content =
          '<link rel="stylesheet" type="text/css" href="slide26/slide26.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Games</p></div><div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div><div class="title6" class="frameopen"><p></p></div><div class="container"><div class="title3" class="frameopen"><p>Emperor’s Constipation</p><video src="slide26/1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="title7" class="frameopen"><p>Glaucoma Awareness</p><video src="slide26/2.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="Bottomtitle"></div></div>';
        break;

      case 44:
        content =
          '<link rel="stylesheet" type="text/css" href="slide27/slide27.css" media="screen"/><div class="background"><img src="slide4/Slide4Bg.jpg" width="1024" height="768"></div><div class="title1" class="frameopen"><p>Games</p></div>  <div class="title2" class="frameopen"><img src="slide2/DigiLateral Logo.png"/></div> <div class="title3" class="frameopen"><video src="slide27/1.mp4" width="400" height="610" controls controlslist="nodownload"></video></div><div class="Bottomtitle"></div>';
        break;
    }
  }

  return content;
}

function showDiv() {
  document.getElementById("welcomeDiv").style.display = "block";
}
function showDiv2() {
  document.getElementById("welcomeDiv2").style.display = "block";
}

function open_page(url, page_id) {
  localStorage.getItem("currentbrand");
  localStorage.getItem("currentcontent");
  localStorage.getItem("currentcontentbrandId");
  localStorage.getItem("current");
  localStorage.setItem("gotoNextPrevBrand", 0);
  //alert("====currentbrand======"+localStorage.getItem('currentbrand'));
  //alert("====currentcontent======"+localStorage.getItem('currentcontent'));
  //alert("====currentcontentbrandId======"+localStorage.getItem('currentcontentbrandId'));
  //alert("====current======"+localStorage.getItem('current'));
  //alert("====previousslide======"+localStorage.getItem("previousslide"));

  //alert("====page_id======"+page_id);
  var objectData = {
    gotoNextPrevBrand: localStorage.getItem("gotoNextPrevBrand"),
    previousslide: localStorage.getItem("previousslide"),
    slideId: page_id,
  };
  var params = {
    query: objectData,
    type: "brandNavigation",
    callback: "checkLastPgFn",
  };

  //window.messageHandler.postMessage(JSON.stringify(params));
  window.messageHandler = {
    postMessage: function (message) {
      // Implementation of postMessage
      JSON.stringify(params);
    },
  };

  /* // alert(page_id);
	//step 10:
	if (typeof(localStorage.getItem("currentslide"))!='undefined'){
		//to checked previous slide has god end time...
		var slideid=localStorage.getItem("currentslide");
		toCaptureTime(slideid);
		
	}
	
	// toCaptureTime(page_id);
	 localStorage.setItem("currentslide",page_id);
	 currentContentNSlide = currentContentId+"_"+contentName+"_"+page_id;
	 localStorage.setItem("current",currentContentNSlide);
	//step 10 ends here */

  $("#wrapper").attr("rel", page_id);
  var content = "";
  var pg_content = set_pg_content(currentSection, page_id);

  $("#main_content").html(pg_content);

  if (page_id == 4) {
    $(".box2").click(function (event) {
      open_page("", 5);
    });
    $(".box3").click(function (event) {
      open_page("", 6);
    });
    $(".box4").click(function (event) {
      open_page("", 7);
    });
    $(".box5").click(function (event) {
      open_page("", 8);
    });
    $(".box6").click(function (event) {
      open_page("", 9);
    });
    $(".box7").click(function (event) {
      open_page("", 10);
    });
    $(".box8").click(function (event) {
      open_page("", 11);
    });
  }
  checkClickThrough();
}

function checkClickThrough() {
  var currentslide = localStorage.getItem("currentslide");
  //alert(currentslide);
  document.getElementById("click_through").innerHTML = "";

  if (currentslide == 1) {
    document.getElementById("click_through").innerHTML = "";
  }
  if (currentslide == 2) {
    document.getElementById("click_through").innerHTML = "";
  }
}

function checkBtns(refNum) {
  switch (refNum) {
    case 1:
      open_page("", 1);
      break;
  }
}

function updateActiveThumbnail() {
  $(".slides").removeClass("active");

  $(
    ".slides[data-page-id='" + currentSectionSlides[currentSectionIndex] + "']",
  ).addClass("active");
}

function currentSlide() {
  updateActiveThumbnail();
}

var ln = 0;
function myconsole(msg) {
  var oldMsg = "</br>" + ln + ". " + $("#myconsole").html();
  ln++;
  $("#myconsole").html(msg + oldMsg);
}

function currentTimeInDatabaseFormat() {
  //to get current time in dd-mm-yyyy hh:mm:ss
  var year = new Date().getFullYear();
  var month = new Date().getMonth();
  month = parseInt(month) + 1;
  if (month.toString().length == 1) {
    month = "0" + month;
  }

  var date = new Date().getDate();
  if (date.toString().length == 1) {
    date = "0" + date;
  }

  var hour = new Date().getHours();
  if (hour.toString().length == 1) {
    hour = "0" + hour;
  }

  var minutes = new Date().getMinutes();
  if (minutes.toString().length == 1) {
    minutes = "0" + minutes;
  }

  var seconds = new Date().getSeconds();
  if (seconds.toString().length == 1) {
    seconds = "0" + seconds;
  }

  var duration =
    year +
    "-" +
    month +
    "-" +
    date +
    "-" +
    hour +
    ":" +
    minutes +
    ":" +
    seconds;
  return duration;
}

$(document).ready(function () {
  $("body").on("click", ".touchbtn", function () {
    $(".right_arrow").trigger("click");
  });

  $(document).on("click", ".btnshow", function () {
    //alert('hi')
    $(".touchbtn").css("display", "block");
  });
});

// new logic starts

// popup1 function

function imageshow1() {
  setTimeout(function () {
    $(".framep").toggle();
    $(".frameclosep").show();
  }, 100);
}

// popup1 close function

function frameclosep() {
  setTimeout(function () {
    $(".framep").hide();
    $(".frameclosep").hide();
  }, 100);
}

// popup2 function

function imageshow2() {
  setTimeout(function () {
    $(".framep2").toggle();
    $(".frameclosep2").show();
  }, 100);
}

// popup1 close function

function frameclosep2() {
  setTimeout(function () {
    $(".framep2").hide();
    $(".frameclosep2").hide();
  }, 100);
}

// popup3 function

function imageshow3() {
  setTimeout(function () {
    $(".framep3").toggle();
    $(".frameclosep3").show();
  }, 100);
}

// popup3 close function

function frameclosep3() {
  setTimeout(function () {
    $(".framep3").hide();
    $(".frameclosep3").hide();
  }, 100);
}

// popup4 function

function imageshow4() {
  setTimeout(function () {
    $(".framep4").toggle();
    $(".frameclosep4").show();
  }, 100);
}

// popup4 close function

function frameclosep4() {
  setTimeout(function () {
    $(".framep4").hide();
    $(".frameclosep4").hide();
  }, 100);
}

// popup5 function

function imageshow5() {
  setTimeout(function () {
    $(".framep5").toggle();
    $(".frameclosep5").show();
  }, 100);
}

// popup5 close function

function frameclosep5() {
  setTimeout(function () {
    $(".framep5").hide();
    $(".frameclosep5").hide();
  }, 100);
}

// new logic ends

/*--------------------- animation javascript -----------------------*/

function s9_pop1() {
  $(".s9_1").css("display", "block");
  $(".s9_c1ose1").css("display", "block");
  $(".s9_pop1").css("display", "none");
}
/*--------------------- animation javascript -----------------------*/

function framepop() {
  setTimeout(function () {
    $(".frame").show();
    $(".frameclose").show();
    $(".frameopen").hide();
    // $(".4.png").hide();
    $(".background").show();
    $("#frameopeneded").show();
  }, 100);
}

function framepop1() {
  setTimeout(function () {
    $(".frame3").show();
    $(".frameclose3").show();
    $(".frameopen1").hide();
    // $(".4.png").hide();
    $(".background").show();
    $("#frameopeneded").show();
  }, 100);
}

function framepop2() {
  setTimeout(function () {
    $(".frame4").show();
    $(".frameclose4").show();
    $(".frameopen2").hide();
    // $(".4.png").hide();
    $(".background").show();
    $("#frameopeneded").show();
  }, 100);
}

function frameclose() {
  setTimeout(function () {
    $(".frame").hide();
    $(".frameclose").hide();
    $(".frameopen").show();
    $(".girl1image").show();
    $(".background").show();
    $("#frameopeneded").show();
  }, 100);
}

// function framepop2() {
//   setTimeout(function () {
//     $(".title1").show();
//     $(".title2").show();
//   }, 100);
// }

// another popup in slide13

function framepopped() {
  setTimeout(function () {
    $(".frame2").show();
    $(".frameclose2").show();
    // $("#frameopened").hide();
    $("#frameopeneded").show();
    $(".background").show();
    $(".title3").show();
    $(".title1").show();
  }, 100);
}

function framepopped1() {
  setTimeout(function () {
    $(".frame").show();
    $(".frameclose").show();
    // $("#frameopened").hide();
    $("#frameopeneded").show();
    $(".background").show();
    $(".title4").show();
    $(".title1").show();
  }, 100);
}

function frameclose2() {
  setTimeout(function () {
    $(".frame2").hide();
    $(".frameclose2").hide();
    $("#frameopened").show();
    $("#frameopeneded").show();
  }, 100);
}

// another popup in slide13

function framepoppeded() {
  setTimeout(function () {
    $(".frame").show();
    $(".frameclose3").show();
    $("#frameopeneded").hide();
    $(".title2").show();
    $(".title3").show();
    $(".title1").show();
  }, 100);
}

function frameclose3() {
  setTimeout(function () {
    $(".frame3").hide();
    $(".frameclose3").hide();
    $("#frameopen1").show();
  }, 100);
}

// 4th popup

function framepoppeded2() {
  setTimeout(function () {
    $(".frame4").show();
    $(".frameclose4").show();
    $("#frameopeneded2").hide();
    $(".title4").show();
    $(".title2").show();
  }, 100);
}

function frameclose4() {
  setTimeout(function () {
    $(".frame4").hide();
    $(".frameclose4").hide();
    $("#frameopeneded2").show();
  }, 100);
}

// 5th popup

function framepopped3() {
  setTimeout(function () {
    $(".frame3").show();
    $(".frameclose3").show();
    $("#frameopened").hide();
    $(".title3").show();
    $(".title1").show();
  }, 100);
}

function frameclose5() {
  setTimeout(function () {
    $(".frame5").hide();
    $(".frameclose5").hide();
    $("#frameopeneded3").show();
  }, 100);
}
