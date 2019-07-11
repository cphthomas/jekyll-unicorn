/*
  Quick quiz bootstrap extension
*/


;(function($) {

// keep track of number of quizes added to page
var quiz_count = 0;

// add jQuery selection method to create
// quiz structure from question json file
// "filename" can be path to question json
// or javascript object
$.fn.quiz = function(filename) {
  if (typeof filename === "string") {
    $.getJSON(filename, render.bind(this));
  } else {
    render.call(this, filename);
  }
};

// create html structure for quiz
// using loaded questions json
function render(quiz_opts) {


  // list of questions to insert into quiz
  var questions = quiz_opts.questions;

  // keep track of the state of correct
  // answers to the quiz so far
  var state = {
    correct : 0,
    total : questions.length
  };

  var $quiz = $(this)
    .attr("class", "carousel slide")
    .attr("data-ride", "carousel");

  // unique ID for container to refer to in carousel
  var name = $quiz.attr("id") || "urban_quiz_" + (++quiz_count);

  $quiz.attr('id', name);

  var height = $quiz.height();


  /*
    Add carousel indicators
  */


  /*
    Slides container div
  */
  var $slides = $("<div>")
    .attr("class", "carousel-inner")
    .attr("role", "listbox")
    .appendTo($quiz);

  /*
    Create title slide
  */
  var $title_slide = $("<div>")
    .attr("class", "item active")
    .attr("height", height + "px")
    .appendTo($slides);

  $('<h1>')
    .text(quiz_opts.title)
    .attr('class', 'quiz-title')
    .appendTo($title_slide);

  var $start_button = $("<div>")
    .attr("class", "quiz-answers")
    .appendTo($title_slide);

var $indicators = $('<ol>')
    .attr('class', 'progress-circles')

  $("<button>")
    .attr('class', 'quiz-button btn')
    .text("Start quiz!")
    .click(function() {
      $quiz.carousel('next');
      $indicators.addClass('show');

    $(".active .quiz-button.btn").each(function(){
      console.log(this.getBoundingClientRect())
      $(this).css("margin-left", function(){
        return ((250 - this.getBoundingClientRect().width) *0.5) + "px"
      })
    })



    })
    .appendTo($start_button);

  $indicators
    .appendTo($quiz);

  $.each(questions, function(question_index, question) {
    $('<li>')
      .attr('class', question_index ? "" : "dark")
      .appendTo($indicators);
  });

  /*
    Add all question slides
  */
  $.each(questions, function(question_index, question) {

    var last_question = (question_index + 1 === state.total);

    var $item = $("<div>")
      .attr("class", "item")
      .attr("height", height + "px")
      .appendTo($slides);
    var $img_div;
    if (question.image) {
      $img_div = $('<div>')
        .attr('class', 'question-image')
        .appendTo($item);
      $("<img>")
        .attr("class", "img-responsive")
        .attr("src", question.image)
        .appendTo($img_div);
      $('<p>')
        .text(question.image_credit)
        .attr("class", "image-credit")
        .appendTo($img_div);
    }
    $("<div>")
      .attr("class", "quiz-question")
      .html(question.prompt)
      .appendTo($item);

    var $answers = $("<div>")
      .attr("class", "quiz-answers")
      .appendTo($item);

    // if the question has an image
    // append a container with the image to the item


    // for each possible answer to the question
    // add a button with a click event
    $.each(question.answers, function(answer_index, answer) {

      // create an answer button div
      // and add to the answer container
      var ans_btn = $("<div>")
        .attr('class', 'quiz-button btn')
        .html(answer)
        .appendTo($answers);

      // This question is correct if it's
      // index is the correct index
      var correct = (question.correct.index === answer_index);

      // default opts for both outcomes
      var opts = {
        allowOutsideClick : false,
        allowEscapeKey : false,
        confirmButtonText: "Næste spørgsmål",
        html : true,
        confirmButtonColor: "#0096D2"
      };

      // set options for correct/incorrect
      // answer dialogue
      if (correct) {
        opts = $.extend(opts, {
          title: "Flot!",
          text: "Supergodt klaret" + (
            question.correct.text ?
            ("<div class=\"correct-text\">" +
              question.correct.text +
              "</div>"
            ) : ""),
          type: "success"
        });
      } else {
        opts = $.extend(opts, {
          title: "Æv",
          text: (
            "Det er desværre ikke rigtigt!<br/><br/>" +
            "Det korrekte svar er \"" +
            question.answers[question.correct.index] + "\"." + (
            question.correct.text ?
            ("<div class=\"correct-text\">" +
              question.correct.text +
              "</div>"
            ) : "")
            ),
          type: "error"
        });
      }

      if (last_question) {
        opts.confirmButtonText = "Se dine resultater";
      }

      // bind click event to answer button,
      // using specified sweet alert options
      ans_btn.on('click', function() {

        function next() {
          // if correct answer is selected,
          // keep track in total
          if (correct) state.correct++;
          $quiz.carousel('next');

          // if we've reached the final question
          // set the results text
          if (last_question) {
            $results_title.html(resultsText(state));
            $results_ratio.text(
              "Du besvarede " +
              Math.round(100*(state.correct/state.total)) +
              "% af spørgmålene korrekt!"
            );
            $twitter_link.attr('href', tweet(state, quiz_opts));
            $facebook_link.attr('href', facebook(state, quiz_opts));
            $indicators.removeClass('show');
            // indicate the question number
            $indicators.find('li')
              .removeClass('dark')
              .eq(0)
              .addClass('dark');
          } else {
            // indicate the question number
            $indicators.find('li')
              .removeClass('dark')
              .eq(question_index+1)
              .addClass('dark');
          }
          // unbind event handler
          $('.sweet-overlay').off('click', next);
        }

        // advance to next question on OK click or
        // click of overlay
        swal(opts, next);
        $('.sweet-overlay').on('click', next);

      });

    });


  });


  // final results slide
  var $results_slide = $("<div>")
    .attr("class", "item")
    .attr("height", height + "px")
    .appendTo($slides);

  var $results_title = $('<h1>')
    .attr('class', 'quiz-title')
    .appendTo($results_slide);

  var $results_ratio = $('<div>')
    .attr('class', 'results-ratio')
    .appendTo($results_slide);

  var $restart_button = $("<div>")
    .attr("class", "quiz-answers")
    .appendTo($results_slide);

  var $social = $("<div>")
    .attr('class', 'results-social')
    .html('<div id = "social-text">Kunne du lide quizzen? Del resultater med dine venner, så de kan forsøge sig!</div>')
    .appendTo($results_slide);

  var $twitter_link = $('<a>')
    .html('<span class="social social-twitter follow-tw"></span>')
    .appendTo($social);

  var $facebook_link = $('<a>')
    .html('<span class="social social-facebook follow-fb"></span>')
    .appendTo($social);

  $("<button>")
    .attr('class', 'quiz-button btn')
    .text("Prøv igen?")
    .click(function() {
      state.correct = 0;
      $quiz.carousel(0);
    })
    .appendTo($restart_button);

  $quiz.carousel({
    "interval" : false
  });

  $(window).on('resize', function() {
    $quiz.find(".item")
      .attr('height', $quiz.height() + "px");
  });

}

function resultsText(state) {

  var ratio = state.correct / state.total;
  var text;

  switch (true) {
    case (ratio === 1):
      text = "Wow&mdash;perfect score, du hedder herefter hjernen!<br><br><IMG SRC=\"img/100correct.gif\" width=\"40%\" height=\"40%\" align=\"center\">";
      break;
    case (ratio > 0.95):
      text = "Fantastisk klaret, du fik næsten alle rigtige :O)<br><br><IMG SRC=\"img/happydumbdumber.gif\" width=\"80%\" height=\"80%\" align=\"center\">";
      break;
    case (ratio > 0.9):
      text = "Suuuper klaret !!! Mere end 90% rigtige :O)<br><br><IMG SRC=\"img/aceventuradoor.gif\" width=\"80%\" height=\"80%\" align=\"center\">";
      break;
    case (ratio > 0.85):
      text = "Rigtig rigtig rigtig flot.<br><br><IMG SRC=\"img/indy.gif\" width=\"80%\" height=\"80%\" align=\"center\">";
      break;
    case (ratio > 0.8):
      text = "Rigtig flot.<br><br><IMG SRC=\"img/cramerhappy.img\" width=\"80%\" height=\"80%\" align=\"center\">";
      break;
    case (ratio > 0.75):
      text = "Rigtig flot.<br><br><IMG SRC=\"img/kramer2.gif\" width=\"80%\" height=\"80%\" align=\"center\">";
      break;
    case (ratio > 0.7):
      text = "Godt klaret :O)<br><br><IMG SRC=\"https://i.gifer.com/6os.gif\" width=\"80%\" height=\"80%\" align=\"center\">";
      break;
    case (ratio > 0.60):
      text = "Rimeligt godt, vi siger det er bestået.<br><br><IMG SRC=\"https://i.gifer.com/GGmT.gif\" width=\"60%\" height=\"60%\" align=\"center\">";
      break;
    case (ratio > 0.5):
      text = "OK det kan dog forbedres.<br><br><IMG SRC=\"img/seinfeldpez.gif\" width=\"80%\" height=\"80%\" align=\"center\">";
      break;
      case (ratio > 0.4):
      text = "OK det kan du nok klare bedre :O)<br><br><IMG SRC=\"img/hit.gif\" width=\"80%\" height=\"80%\" align=\"center\">";
      break;
      case (ratio > 0.3):
      text = "Forsøg gerne igen, så går det nok bedre :O)<br><br><IMG SRC=\"img/25pctcorrect.gif\" width=\"80%\" height=\"80%\" align=\"center\">";
      break;
      case (ratio > 0.2):
      text = "Æv altså, prøv igen, så går det meget bedre :O)<br><br><IMG SRC=\"img/johncleese.gif\" width=\"80%\" height=\"80%\" align=\"center\">";
      break;
    case (ratio < 0.2 && ratio !== 0):
      text = "Den var hård, bedre held næste gang.<br><br><IMG SRC=\"img/tom.gif\" width=\"60%\" height=\"60%\" align=\"center\">";
      break;
    case (ratio === 0):
      text = "Uha, ingen korrekte. Prøv igen<br><br><IMG SRC=\"img/bean.gif\" width=\"50%\" height=\"50%\" align=\"center\">";
      break;
  }
  return text;

}


function tweet(state, opts) {

  var body = (
    "I got " + state.correct +
    " out of " + state.total +
    " on @taxpolicycenter’s \"" + opts.title +
    "\" quiz. Test din viden: " + opts.url
  );

  return (
    "http://twitter.com/intent/tweet?text=" +
    encodeURIComponent(body)
  );

}

function facebook(state, opts) {
  return "https://www.facebook.com/sharer/sharer.php?u=" + "https://www.tepedu.dk/";
}


})(jQuery);

