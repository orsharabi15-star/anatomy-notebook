(() => {
  'use strict';

  const questions = [
    {
      text: 'היכן נאחז גיד השריר העל־קוצי?',
      options: [
        'בגבשושית הקטנה של ההומרוס בלבד',
        'במשטח העליון של הגבשושית הגדולה בהומרוס, תוך התמזגות עם קופסית המפרק',
        'בזיז הקורקואיד של השכמה',
        'בגבשושית הדלתואידית של ההומרוס'
      ],
      correct: 1,
      explanation: 'האחז הוא ב־Superior facet של הגבשושית הגדולה. הגיד מתחבר גם לקופסית הגלנו־הומרלית — לא לגבשושית הקטנה.'
    },
    {
      text: 'איזה עצב מעצבב את השריר העל־קוצי?',
      options: [
        'העצב העל־שכמתי (Suprascapular nerve), שורשי C5–C6',
        'העצב האקסילרי (Axillary nerve), שורשי C5–C6',
        'העצב השכמתי הגבי (Dorsal scapular nerve), שורש C5',
        'העצב החזי־גבי (Thoracodorsal nerve), שורשי C6–C8'
      ],
      correct: 0,
      explanation: 'העצב העל־שכמתי, שמקורו בגזע העליון של מקלעת הזרוע, מעצבב את השריר בסיבים משורשי C5–C6. העצב האקסילרי מעצבב, בין היתר, את הדלתואיד.'
    },
    {
      text: 'איזו אמירה מתארת במדויק את פעולת השריר?',
      options: [
        'הוא פועל רק ב־0–15° הראשונות, ואז מפסיק לפעול',
        'פעולתו הראשית היא סיבוב פנימי של הזרוע',
        'הוא מתחיל ותורם לחטיפה, פועל גם בהמשך הטווח ומייצב את ראש ההומרוס',
        'הוא מוריד את השכמה ומבצע פרוטרקציה'
      ],
      correct: 2,
      explanation: 'הקישור לתחילת החטיפה הוא כלל לימודי, לא נקודת כיבוי. השריר ממשיך לתרום לחטיפה עם הדלתואיד ומייצב את ראש ההומרוס מול הגלנואיד.'
    }
  ];

  const letters = ['א', 'ב', 'ג', 'ד'];
  const answers = questions.map(() => null);
  let current = 0;
  const card = document.getElementById('quiz-card');
  const position = document.getElementById('question-position');
  const score = document.getElementById('quiz-score');
  const progress = document.getElementById('quiz-progress');
  const panel = document.getElementById('question-panel');
  const text = document.getElementById('question-text');
  const options = document.getElementById('quiz-options');
  const feedback = document.getElementById('quiz-feedback');
  const prev = document.getElementById('quiz-prev');
  const next = document.getElementById('quiz-next');
  const completion = document.getElementById('quiz-completion');
  const review = document.getElementById('answer-review');

  function correctCount() {
    return answers.filter((answer, index) => answer === questions[index].correct).length;
  }

  function updateStats() {
    score.textContent = `${correctCount()} תשובות נכונות`;
    progress.value = answers.filter(answer => answer !== null).length;
  }

  function showFeedback() {
    const answer = answers[current];
    if (answer === null) {
      feedback.hidden = true;
      feedback.replaceChildren();
      return;
    }
    const question = questions[current];
    const isCorrect = answer === question.correct;
    const heading = document.createElement('strong');
    heading.textContent = isCorrect ? 'נכון — יפה זכרתם.' : 'עוד הזדמנות ללמוד — זו אינה התשובה הנכונה.';
    const explanation = document.createElement('p');
    explanation.textContent = question.explanation;
    feedback.dataset.kind = isCorrect ? 'correct' : 'incorrect';
    feedback.replaceChildren(heading, explanation);
    feedback.hidden = false;
  }

  function renderQuestion(focusHeading = false) {
    const question = questions[current];
    const answer = answers[current];
    position.textContent = `שאלה ${current + 1} מתוך ${questions.length}`;
    text.textContent = question.text;
    text.tabIndex = -1;
    options.replaceChildren();
    question.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiz-option';
      button.setAttribute('aria-pressed', String(answer === index));
      const letter = document.createElement('span');
      letter.className = 'option-letter';
      letter.setAttribute('aria-hidden', 'true');
      letter.textContent = letters[index];
      const optionText = document.createElement('span');
      optionText.className = 'option-text';
      optionText.textContent = option;
      button.append(letter, optionText);
      if (answer !== null) {
        button.disabled = true;
        if (index === question.correct || index === answer) {
          const marker = document.createElement('span');
          marker.className = 'option-marker';
          marker.textContent = index === question.correct ? 'התשובה הנכונה' : 'התשובה שנבחרה';
          button.classList.add(index === question.correct ? 'correct' : 'incorrect');
          button.append(marker);
        }
      }
      button.addEventListener('click', () => {
        if (answers[current] !== null) return;
        answers[current] = index;
        renderQuestion();
        next.focus({ preventScroll: true });
      });
      options.append(button);
    });
    prev.disabled = current === 0;
    next.disabled = answer === null;
    next.textContent = current === questions.length - 1 ? 'סיום התרגול ←' : 'השאלה הבאה ←';
    updateStats();
    showFeedback();
    if (focusHeading) text.focus({ preventScroll: true });
  }

  prev.addEventListener('click', () => {
    if (current > 0) {
      current -= 1;
      renderQuestion(true);
    }
  });

  next.addEventListener('click', () => {
    if (answers[current] === null) return;
    if (current < questions.length - 1) {
      current += 1;
      renderQuestion(true);
      return;
    }
    panel.hidden = true;
    completion.hidden = false;
    position.textContent = '3 מתוך 3 שאלות הושלמו';
    const count = correctCount();
    const title = document.getElementById('completion-title');
    title.textContent = `${count} מתוך ${questions.length} תשובות נכונות`;
    document.getElementById('completion-message').textContent = count === questions.length
      ? 'המוצא, האחז, העצבוב והפעולה מתחברים. תוכלו להסתיר שוב את פרופיל השריר ולנסות שליפה ללא רמזים.'
      : 'הטעויות הן חלק מהלמידה. קראו את ההסברים, חזרו לפרופיל השריר ואז נסו שוב.';
    review.replaceChildren();
    questions.forEach((question, index) => {
      const item = document.createElement('li');
      const heading = document.createElement('strong');
      heading.textContent = `${answers[index] === question.correct ? 'נכון' : 'לחזרה'} · ${question.text}`;
      const answer = document.createElement('p');
      answer.textContent = `התשובה הנכונה: ${question.options[question.correct]}`;
      const explanation = document.createElement('p');
      explanation.textContent = question.explanation;
      item.append(heading, answer, explanation);
      review.append(item);
    });
    title.focus({ preventScroll: true });
  });

  document.getElementById('quiz-restart').addEventListener('click', () => {
    answers.fill(null);
    current = 0;
    completion.hidden = true;
    panel.hidden = false;
    renderQuestion(true);
  });

  const recall = document.getElementById('toggle-recall');
  let recallHidden = false;
  recall.addEventListener('click', () => {
    recallHidden = !recallHidden;
    document.querySelectorAll('.field-answer').forEach(answer => { answer.hidden = recallHidden; });
    document.querySelectorAll('.field-prompt').forEach(prompt => { prompt.hidden = !recallHidden; });
    recall.setAttribute('aria-pressed', String(recallHidden));
    recall.textContent = recallHidden ? 'חשיפת תשובות' : 'הסתרת תשובות';
    document.getElementById('recall-instruction').textContent = recallHidden
      ? 'התשובות מוסתרות. נסו לענות על הרמזים לפני שתחשפו אותן.'
      : 'קראו את השדות הקבועים, ואז הסתירו את התשובות ונסו לשלוף מהזיכרון.';
    document.getElementById('recall-status').textContent = recallHidden ? 'תשובות פרופיל השריר מוסתרות.' : 'תשובות פרופיל השריר גלויות.';
  });

  document.querySelectorAll('[data-notebook-lesson]').forEach(link => {
    link.addEventListener('click', event => {
      if (window.parent === window || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      try {
        if (window.parent.location.origin !== window.location.origin) return;
        const hostFrame = window.parent.document.getElementById('lesson-frame');
        if (!hostFrame || hostFrame.contentWindow !== window) return;
        event.preventDefault();
        window.parent.postMessage({ type: 'notebook-open-section', lesson: link.dataset.notebookLesson }, window.location.origin);
      } catch {
        // Standalone and cross-origin embedding keep the normal link behavior.
      }
    });
  });

  renderQuestion();
  card.hidden = false;
})();
