"use strict";
// This pilot is independent of the lesson shell and the flashcard app.
const quiz = document.getElementById("quiz");
const feedback = document.getElementById("quiz-feedback");
quiz.addEventListener("submit", (event) => {
  event.preventDefault();
  const answer = new FormData(quiz).get("nerve");
  if (!answer) return;
  const correct = answer === "suprascapular";
  feedback.dataset.result = correct ? "correct" : "retry";
  feedback.textContent = correct
    ? "נכון. העצב העל-שכמי (Suprascapular nerve), משורשי C5-C6, מעצבב את הסופראספינאטוס."
    : "עוד ניסיון. חפשי את העצב ששמו מזכיר את המיקום מעל השכמה. אפשר לחזור לכרטיס העצבוב ולנסות שוב.";
  feedback.hidden = false;
});
quiz.addEventListener("change", () => { feedback.hidden = true; feedback.textContent = ""; });
quiz.addEventListener("reset", () => { feedback.hidden = true; feedback.textContent = ""; delete feedback.dataset.result; });
const motion = document.getElementById("motion-image");
const motionToggle = document.getElementById("motion-toggle");
motionToggle.addEventListener("click", () => {
  const play = motionToggle.getAttribute("aria-pressed") !== "true";
  motion.src = "../assets/concepts/supraspinatus/" + (play ? "supraspinatus-abduction.gif" : "abduction-still.png");
  motionToggle.setAttribute("aria-pressed", String(play));
  motionToggle.textContent = play ? "עצירת ההמחשה" : "הפעלת ההמחשה";
});
// Reveal the related illustration before following its local link.
function revealRelatedIllustration() {
  if (location.hash === "#infraspinatus-figure") {
    document.querySelector(".gallery-details").open = true;
    document.getElementById("infraspinatus-figure").scrollIntoView();
  }
}
window.addEventListener("hashchange", revealRelatedIllustration);
revealRelatedIllustration();
