let selectedAnswers = {};
let selectedWordFromBank = null;
let _currentSelectionRange = null;
let _currentContainer = null;

document.addEventListener('DOMContentLoaded', function () {
    setupBankedCloze();
    generateDynamicOptions();
    loadSavedAnswers();
    setupWordTranslation();
});

function setupBankedCloze() {
    var sectionType = getSectionType();
    if (sectionType !== 'BANKED_CLOZE') return;

    var passageContent = document.getElementById('passageContent');
    if (!passageContent) return;

    var questionsList = document.getElementById('questionsList');
    var questionMap = {};
    if (questionsList) {
        var qItems = questionsList.querySelectorAll('.question-item');
        qItems.forEach(function(item) {
            var qNumEl = item.querySelector('.q-number');
            if (!qNumEl) return;
            var num = parseInt(qNumEl.textContent);
            var qId = item.id.replace('q-', '');
            var correctEl = item.querySelector('.correct-answer');
            var correctAnswer = correctEl ? correctEl.textContent.replace('正确答案：', '').trim() : '';
            questionMap[num] = { id: qId, correctAnswer: correctAnswer };
        });
    }

    var html = passageContent.innerHTML;
    html = html.replace(/\((\d+)\)_{3,6}/g, function(match, num) {
        var qData = questionMap[parseInt(num)];
        var qId = qData ? qData.id : '';
        return '<span class="banked-blank" data-blank-num="' + num + '" data-question-id="' + qId + '">______</span>';
    });
    passageContent.innerHTML = html;

    var wordBankGrid = document.getElementById('wordBankGrid');
    if (!wordBankGrid) return;

    wordBankGrid.addEventListener('dragstart', function(e) {
        var item = e.target.closest('.word-bank-item');
        if (!item || item.classList.contains('used')) {
            e.preventDefault();
            return;
        }
        var letter = item.getAttribute('data-word-letter');
        e.dataTransfer.setData('text/plain', letter);
        e.dataTransfer.effectAllowed = 'move';
        item.classList.add('dragging');
        selectedWordFromBank = letter;
    });

    wordBankGrid.addEventListener('dragend', function(e) {
        var item = e.target.closest('.word-bank-item');
        if (item) item.classList.remove('dragging');
    });

    wordBankGrid.addEventListener('click', function(e) {
        var item = e.target.closest('.word-bank-item');
        if (!item || item.classList.contains('used')) return;
        document.querySelectorAll('.word-bank-item').forEach(function(w) {
            w.classList.remove('selected-word');
        });
        item.classList.add('selected-word');
        selectedWordFromBank = item.getAttribute('data-word-letter');
    });

    passageContent.addEventListener('dragover', function(e) {
        var blank = e.target.closest('.banked-blank');
        if (blank && !blank.classList.contains('filled')) {
            e.preventDefault();
            blank.classList.add('drag-over');
        }
    });

    passageContent.addEventListener('dragleave', function(e) {
        var blank = e.target.closest('.banked-blank');
        if (blank) blank.classList.remove('drag-over');
    });

    passageContent.addEventListener('drop', function(e) {
        var blank = e.target.closest('.banked-blank');
        if (!blank || blank.classList.contains('filled')) return;
        e.preventDefault();
        blank.classList.remove('drag-over');
        var letter = e.dataTransfer.getData('text/plain');
        if (!letter && selectedWordFromBank) {
            letter = selectedWordFromBank;
        }
        if (letter) fillBlank(blank, letter);
    });

    passageContent.addEventListener('click', function(e) {
        var blank = e.target.closest('.banked-blank');
        if (!blank) return;
        if (blank.classList.contains('filled')) {
            clearBlank(blank);
        } else if (selectedWordFromBank) {
            fillBlank(blank, selectedWordFromBank);
            selectedWordFromBank = null;
            document.querySelectorAll('.word-bank-item').forEach(function(w) {
                w.classList.remove('selected-word');
            });
        }
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.word-bank-item') && !e.target.closest('.banked-blank')) {
            selectedWordFromBank = null;
            document.querySelectorAll('.word-bank-item').forEach(function(w) {
                w.classList.remove('selected-word');
            });
        }
    });
}

function fillBlank(blank, letter) {
    if (blank.classList.contains('filled')) return;

    var wordItems = document.querySelectorAll('.word-bank-item');
    var wordText = '';
    wordItems.forEach(function(w) {
        if (w.getAttribute('data-word-letter') === letter) {
            wordText = w.querySelector('.word-text').textContent.trim();
        }
    });
    if (!wordText) return;

    blank.textContent = wordText;
    blank.classList.add('filled');
    blank.setAttribute('data-value', letter);

    wordItems.forEach(function(w) {
        if (w.getAttribute('data-word-letter') === letter) {
            w.classList.add('used');
        }
    });

    var qId = blank.getAttribute('data-question-id');
    if (qId) {
        selectedAnswers[qId] = letter;
        localStorage.setItem('answers_' + getPageKey(), JSON.stringify(selectedAnswers));
    }
}

function clearBlank(blank) {
    if (!blank.classList.contains('filled')) return;

    var oldValue = blank.getAttribute('data-value');
    if (oldValue) {
        var wordItems = document.querySelectorAll('.word-bank-item');
        wordItems.forEach(function(w) {
            if (w.getAttribute('data-word-letter') === oldValue) {
                w.classList.remove('used', 'selected-word');
            }
        });
    }

    var qId = blank.getAttribute('data-question-id');
    if (qId) {
        delete selectedAnswers[qId];
        localStorage.setItem('answers_' + getPageKey(), JSON.stringify(selectedAnswers));
    }

    blank.textContent = '______';
    blank.classList.remove('filled', 'correct', 'wrong');
    blank.removeAttribute('data-value');
}

function getSectionType() {
    var readingInfo = document.querySelector('.reading-info');
    if (readingInfo) {
        return readingInfo.getAttribute('data-section-type') || '';
    }
    return '';
}

function generateDynamicOptions() {
    var sectionType = getSectionType();

    if (sectionType === 'LONG_READING') {
        var passageContent = document.getElementById('passageContent');
        var content = passageContent ? passageContent.textContent : '';
        var paraLetters = [];
        var regex = /\b([A-Z])\)\s/g;
        var match;
        while ((match = regex.exec(content)) !== null) {
            paraLetters.push(match[1]);
        }
        if (paraLetters.length === 0) {
            for (var i = 0; i < 10; i++) {
                paraLetters.push(String.fromCharCode(65 + i));
            }
        }

        wrapParagraphLetters(passageContent);

        document.querySelectorAll('.options').forEach(function (optionsContainer) {
            var existing = optionsContainer.querySelector('select.long-reading-select');
            if (existing) return;

            var questionId = optionsContainer.id.replace('options-', '');
            var select = document.createElement('select');
            select.className = 'long-reading-select';
            select.setAttribute('data-question-id', questionId);

            var defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.textContent = '-- 请选择段落 --';
            select.appendChild(defaultOpt);

            paraLetters.forEach(function (letter) {
                var opt = document.createElement('option');
                opt.value = letter;
                opt.textContent = '段落 ' + letter;
                select.appendChild(opt);
            });

            select.addEventListener('change', function(e) {
                handleLongReadingSelect(e, questionId, paraLetters);
            });

            optionsContainer.innerHTML = '';
            optionsContainer.appendChild(select);
        });

        updateLongReadingOptions();
        return;
    }

    if (sectionType === 'BANKED_CLOZE') return;

    document.querySelectorAll('.options').forEach(function (optionsContainer) {
        var existing = optionsContainer.querySelectorAll('.option-item');
        if (existing.length > 0) return;

        var questionId = optionsContainer.id.replace('options-', '');
        for (var i = 0; i < 4; i++) {
            var letter = String.fromCharCode(65 + i);
            var optDiv = document.createElement('div');
            optDiv.className = 'option-item';
            optDiv.setAttribute('data-question-id', questionId);
            optDiv.setAttribute('data-option-value', letter);
            optDiv.onclick = function () { selectOption(this); };
            optDiv.innerHTML = '<span class="option-label">' + letter + '</span>';
            optionsContainer.appendChild(optDiv);
        }
    });
}

function wrapParagraphLetters(container) {
    if (!container) return;
    var html = container.innerHTML;
    html = html.replace(/\b([A-Z])\)\s/g, function(match, letter) {
        return '<span class="para-letter" data-para-letter="' + letter + '">' + match + '</span>';
    });
    container.innerHTML = html;
}

function handleLongReadingSelect(event, questionId, allLetters) {
    var select = event.target;
    var selectedValue = select.value;

    var prevValue = select.getAttribute('data-prev-value') || '';
    if (prevValue) {
        var prevSpan = document.querySelector('.para-letter[data-para-letter="' + prevValue + '"]');
        if (prevSpan) {
            prevSpan.classList.remove('para-struck');
        }
    }

    if (selectedValue) {
        var span = document.querySelector('.para-letter[data-para-letter="' + selectedValue + '"]');
        if (span) {
            span.classList.add('para-struck');
        }
        selectedAnswers[questionId] = selectedValue;
        select.setAttribute('data-prev-value', selectedValue);
    } else {
        delete selectedAnswers[questionId];
        select.removeAttribute('data-prev-value');
    }

    localStorage.setItem('answers_' + getPageKey(), JSON.stringify(selectedAnswers));

    var explainBox = document.getElementById('explain-' + questionId);
    if (explainBox) {
        explainBox.style.display = 'none';
    }

    updateLongReadingOptions();
}

function updateLongReadingOptions() {
    var selects = document.querySelectorAll('select.long-reading-select');
    if (selects.length === 0) return;

    var usedLetters = {};
    selects.forEach(function (sel) {
        if (sel.value) {
            usedLetters[sel.value] = true;
        }
    });

    selects.forEach(function (sel) {
        var options = sel.querySelectorAll('option');
        options.forEach(function (opt) {
            if (!opt.value) return;
            if (usedLetters[opt.value] && opt.value !== sel.value) {
                opt.disabled = true;
                opt.textContent = '段落 ' + opt.value + ' (已被选)';
            } else {
                opt.disabled = false;
                opt.textContent = '段落 ' + opt.value;
            }
        });
    });
}

function clearHighlights() {
    var highlights = document.querySelectorAll('.highlighted');
    highlights.forEach(function (el) {
        var parent = el.parentNode;
        var text = document.createTextNode(el.textContent);
        parent.replaceChild(text, el);
        parent.normalize();
    });
    localStorage.removeItem('highlights_' + getPageKey());
}

function saveHighlights() {
    var containers = [document.getElementById('passageContent'), document.getElementById('readingRight')];
    var data = [];
    containers.forEach(function(container) {
        if (!container) return;
        var highlights = container.querySelectorAll('.highlighted');
        highlights.forEach(function (el) {
            data.push({ text: el.textContent });
        });
    });
    localStorage.setItem('highlights_' + getPageKey(), JSON.stringify(data));
}

function restoreHighlights() {
    var saved = localStorage.getItem('highlights_' + getPageKey());
    if (!saved) return;
    try {
        var data = JSON.parse(saved);
        var containers = [document.getElementById('passageContent'), document.getElementById('readingRight')];
        data.forEach(function (item) {
            for (var ci = 0; ci < containers.length; ci++) {
                var container = containers[ci];
                if (!container) continue;
                var textNode = getTextNodeContaining(container, item.text);
                if (textNode) {
                    var startIdx = textNode.textContent.indexOf(item.text);
                    if (startIdx >= 0) {
                        var range = document.createRange();
                        range.setStart(textNode, startIdx);
                        range.setEnd(textNode, startIdx + item.text.length);
                        var span = document.createElement('span');
                        span.className = 'highlighted';
                        span.textContent = item.text;
                        try {
                            range.deleteContents();
                            range.insertNode(span);
                        } catch (e) { }
                    }
                    break;
                }
            }
        });
    } catch (e) { }
}

function getTextNodeContaining(root, text) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
        if (node.textContent.includes(text)) {
            return node;
        }
    }
    return null;
}

function setupWordTranslation() {
    var containers = [];
    var passageEl = document.getElementById('passageContent');
    var rightEl = document.getElementById('readingRight');
    if (passageEl) containers.push(passageEl);
    if (rightEl) containers.push(rightEl);
    if (containers.length === 0) return;

    containers.forEach(function(container) {
        container.addEventListener('mouseup', function (e) {
            var selection = window.getSelection();
            if (!selection || selection.isCollapsed) {
                closeTranslation();
                return;
            }

            var selectedText = selection.toString().trim();
            if (selectedText.length === 0 || selectedText.length > 100) {
                closeTranslation();
                return;
            }

            var range = selection.getRangeAt(0);
            if (!container.contains(range.commonAncestorContainer)) return;

            _currentSelectionRange = range;
            _currentContainer = container;
            showTranslationPopup(selectedText, e);
        });
    });

    document.addEventListener('mousedown', function(e) {
        var popup = document.getElementById('translationPopup');
        if (popup && popup.style.display !== 'none' && !popup.contains(e.target)) {
            closeTranslation();
        }
    });
}

function showTranslationPopup(word, event) {
    var popup = document.getElementById('translationPopup');
    var wordEl = document.getElementById('selectedWord');
    if (!popup || !wordEl) return;
    wordEl.textContent = '"' + word + '"';

    popup.style.display = 'block';

    var range = _currentSelectionRange;
    var rect = range.getBoundingClientRect();
    var popupHeight = 40;
    var popupWidth = 180;

    var x = rect.left + (rect.width / 2) - (popupWidth / 2) + window.scrollX;
    var y = rect.top - popupHeight - 8 + window.scrollY;

    if (y < window.scrollY + 10) {
        y = rect.bottom + 8 + window.scrollY;
    }

    var maxX = window.innerWidth - popupWidth - 10;
    popup.style.left = Math.min(Math.max(10, x), maxX) + 'px';
    popup.style.top = y + 'px';
}

function highlightFromPopup() {
    if (!_currentSelectionRange || !_currentContainer) return;

    var selectedText = _currentSelectionRange.toString().trim();
    if (selectedText.length === 0) return;

    var span = document.createElement('span');
    span.className = 'highlighted';
    span.textContent = selectedText;

    try {
        _currentSelectionRange.deleteContents();
        _currentSelectionRange.insertNode(span);
    } catch (e) {
        console.warn('Highlight failed:', e);
    }

    window.getSelection().removeAllRanges();
    _currentSelectionRange = null;
    _currentContainer = null;
    closeTranslation();
    saveHighlights();
}

function closeTranslation() {
    var popup = document.getElementById('translationPopup');
    if (popup) {
        popup.style.display = 'none';
    }
}

function getDictionary() {
    return {};
}

function translateWord(word, callback) {
    var dict = getDictionary();
    if (dict[word.toLowerCase()]) {
        callback(dict[word.toLowerCase()]);
        return;
    }

    fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word))
        .then(function (res) {
            if (!res.ok) throw new Error('Not found');
            return res.json();
        })
        .then(function (data) {
            if (data && data[0] && data[0].meanings) {
                var meanings = data[0].meanings;
                var result = '';
                for (var i = 0; i < Math.min(3, meanings.length); i++) {
                    var m = meanings[i];
                    var def = m.definitions[0];
                    if (def) {
                        result += '[' + m.partOfSpeech + '] ' + def.definition + '\n';
                    }
                }
                callback(result.trim() || '未找到释义');
            } else {
                callback('未找到释义');
            }
        })
        .catch(function () {
            callback('未找到该词的在线释义');
        });
}

function selectOption(el) {
    var questionId = el.getAttribute('data-question-id');
    var optionValue = el.getAttribute('data-option-value');

    var parent = el.parentElement;
    var siblings = parent.querySelectorAll('.option-item');
    siblings.forEach(function (sib) {
        sib.classList.remove('selected');
    });

    el.classList.add('selected');

    selectedAnswers[questionId] = optionValue;
    localStorage.setItem('answers_' + getPageKey(), JSON.stringify(selectedAnswers));

    var explainBox = document.getElementById('explain-' + questionId);
    if (explainBox) {
        explainBox.style.display = 'none';
    }
}

function checkAnswers() {
    var sectionType = getSectionType();

    if (sectionType === 'BANKED_CLOZE') {
        var blanks = document.querySelectorAll('.banked-blank');
        var correct = 0;
        var total = 0;

        blanks.forEach(function (slot) {
            var questionId = slot.getAttribute('data-question-id');
            if (!questionId) return;
            var selectedValue = slot.getAttribute('data-value') || '';
            var correctValue = '';
            var qItem = document.getElementById('q-' + questionId);
            if (qItem) {
                var correctEl = qItem.querySelector('.correct-answer');
                if (correctEl) {
                    correctValue = correctEl.textContent.replace('正确答案：', '').trim();
                }
            }

            slot.classList.remove('correct', 'wrong');

            if (selectedValue) {
                total++;
                if (selectedValue === correctValue) {
                    slot.classList.add('correct');
                    correct++;
                } else {
                    slot.classList.add('wrong');
                }
            } else if (slot.classList.contains('filled')) {
                var wordItems = document.querySelectorAll('.word-bank-item');
                var filledText = slot.textContent.trim();
                wordItems.forEach(function(w) {
                    if (w.querySelector('.word-text').textContent.trim() === filledText) {
                        selectedValue = w.getAttribute('data-word-letter');
                        slot.setAttribute('data-value', selectedValue);
                        total++;
                        if (selectedValue === correctValue) {
                            slot.classList.add('correct');
                            correct++;
                        } else {
                            slot.classList.add('wrong');
                        }
                    }
                });
            }

            var expItem = document.getElementById('banked-exp-' + questionId);
            if (expItem) {
                expItem.style.display = 'block';
                var header = expItem.querySelector('.banked-exp-header');
                if (header) {
                    if (selectedValue && selectedValue === correctValue) {
                        header.style.borderLeftColor = '#4CAF50';
                    } else if (selectedValue) {
                        header.style.borderLeftColor = '#F44336';
                    } else {
                        header.style.borderLeftColor = '#9E9E9E';
                    }
                }
            }
        });

        var expContainer = document.getElementById('bankedExplanations');
        if (expContainer) {
            expContainer.style.display = 'block';
            if (total > 0) {
                expContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        showScore(correct, total);
        return;
    }

    var questionsList = document.getElementById('questionsList');
    if (!questionsList) return;

    var sectionType = getSectionType();
    var questionItems = questionsList.querySelectorAll('.question-item');
    var correctCount = 0;
    var totalCount = 0;

    questionItems.forEach(function (item) {
        var explainBox = item.querySelector('.explanation-box');
        if (!explainBox) return;

        var correctAnswerEl = explainBox.querySelector('.correct-answer');
        if (!correctAnswerEl) return;

        var correctText = correctAnswerEl.textContent;
        var correctValue = correctText.replace('正确答案：', '').trim();

        var questionId = '';

        if (sectionType === 'LONG_READING') {
            var select = item.querySelector('select.long-reading-select');
            if (select) {
                questionId = select.getAttribute('data-question-id') || '';
            }
        } else {
            var firstOption = item.querySelector('.option-item');
            if (firstOption) {
                questionId = firstOption.getAttribute('data-question-id') || '';
            }
        }

        var selectedValue = questionId ? selectedAnswers[questionId] : undefined;

        totalCount++;

        if (sectionType === 'LONG_READING') {
            var select = item.querySelector('select.long-reading-select');
            if (select) {
                select.classList.remove('correct', 'wrong');
                if (selectedValue === correctValue) {
                    select.classList.add('correct');
                } else if (selectedValue) {
                    select.classList.add('wrong');
                }
            }
        } else {
            var options = item.querySelectorAll('.option-item');
            options.forEach(function (opt) {
                opt.classList.remove('correct', 'wrong');
                var optValue = opt.getAttribute('data-option-value');
                if (optValue === correctValue) {
                    opt.classList.add('correct');
                }
                if (selectedValue && optValue === selectedValue && optValue !== correctValue) {
                    opt.classList.add('wrong');
                }
            });
        }

        if (selectedValue === correctValue) {
            correctCount++;
        }

        explainBox.style.display = 'block';
    });

    showScore(correctCount, totalCount);
}

function showScore(correct, total) {
    var scoreDiv = document.getElementById('scoreSummary');
    if (!scoreDiv) {
        scoreDiv = document.createElement('div');
        scoreDiv.id = 'scoreSummary';
        scoreDiv.className = 'score-summary';
        var actionBtns = document.querySelector('.action-buttons');
        if (actionBtns) {
            actionBtns.parentNode.insertBefore(scoreDiv, actionBtns.nextSibling);
        }
    }

    if (total === 0) {
        scoreDiv.innerHTML = '<div class="score-empty">📋 还没有填写任何答案，快去答题吧！</div>';
        scoreDiv.style.display = 'block';
        return;
    }

    var percentage = Math.round((correct / total) * 100);
    var grade = '';
    var color = '';
    if (percentage >= 80) {
        grade = '优秀！';
        color = '#27AE60';
    } else if (percentage >= 60) {
        grade = '及格';
        color = '#F39C12';
    } else {
        grade = '需加油';
        color = '#E74C3C';
    }

    scoreDiv.innerHTML = '<div class="score-card" style="border-left: 4px solid ' + color + ';">' +
        '<span class="score-text">得分：<strong style="color:' + color + ';font-size:1.3em;">' + correct + '/' + total + '</strong> (' + percentage + '%) ' + grade + '</span>' +
        '</div>';
    scoreDiv.style.display = 'block';
}

function resetAnswers() {
    var pageKey = getPageKey();
    selectedAnswers = {};
    localStorage.removeItem('answers_' + pageKey);

    var sectionType = getSectionType();

    if (sectionType === 'BANKED_CLOZE') {
        document.querySelectorAll('.banked-blank').forEach(function (slot) {
            slot.textContent = '______';
            slot.classList.remove('filled', 'correct', 'wrong');
            slot.removeAttribute('data-value');
        });
        document.querySelectorAll('.word-bank-item').forEach(function (w) {
            w.classList.remove('used', 'selected-word');
        });
        selectedWordFromBank = null;
        var expContainer = document.getElementById('bankedExplanations');
        if (expContainer) {
            expContainer.style.display = 'none';
        }
    } else {
        document.querySelectorAll('.option-item').forEach(function (opt) {
            opt.classList.remove('selected', 'correct', 'wrong');
        });
        document.querySelectorAll('select.long-reading-select').forEach(function (sel) {
            sel.value = '';
            sel.classList.remove('correct', 'wrong');
            sel.removeAttribute('data-prev-value');
        });
        document.querySelectorAll('.para-letter').forEach(function (span) {
            span.classList.remove('para-struck');
        });
        updateLongReadingOptions();
    }

    document.querySelectorAll('.explanation-box').forEach(function (box) {
        box.style.display = 'none';
    });

    var scoreDiv = document.getElementById('scoreSummary');
    if (scoreDiv) {
        scoreDiv.style.display = 'none';
    }
}

function loadSavedAnswers() {
    var saved = localStorage.getItem('answers_' + getPageKey());
    if (saved) {
        try {
            selectedAnswers = JSON.parse(saved);
            var sectionType = getSectionType();
            var hasAnyAnswer = Object.keys(selectedAnswers).length > 0;

            if (sectionType === 'BANKED_CLOZE') {
                Object.keys(selectedAnswers).forEach(function (qId) {
                    var slot = document.querySelector('.banked-blank[data-question-id="' + qId + '"]');
                    if (slot) {
                        var letter = selectedAnswers[qId];
                        var wordItems = document.querySelectorAll('.word-bank-item');
                        wordItems.forEach(function (w) {
                            if (w.getAttribute('data-word-letter') === letter) {
                                slot.textContent = w.querySelector('.word-text').textContent.trim();
                                slot.classList.add('filled');
                                slot.setAttribute('data-value', letter);
                                w.classList.add('used');
                            }
                        });
                    }
                });
            } else {
                Object.keys(selectedAnswers).forEach(function (qId) {
                    var options = document.querySelectorAll('[data-question-id="' + qId + '"]');
                    options.forEach(function (opt) {
                        if (opt.tagName === 'SELECT') {
                            opt.value = selectedAnswers[qId];
                            opt.setAttribute('data-prev-value', selectedAnswers[qId]);
                            var span = document.querySelector('.para-letter[data-para-letter="' + selectedAnswers[qId] + '"]');
                            if (span) {
                                span.classList.add('para-struck');
                            }
                        } else if (opt.getAttribute('data-option-value') === selectedAnswers[qId]) {
                            opt.classList.add('selected');
                        }
                    });
                });

                if (sectionType === 'LONG_READING') {
                    updateLongReadingOptions();
                }
            }

            if (hasAnyAnswer) {
                showRestoreNotification();
            }
        } catch (e) { }
    }

    restoreHighlights();
}

function showRestoreNotification() {
    var existing = document.getElementById('restoreNotify');
    if (existing) return;

    var notify = document.createElement('div');
    notify.id = 'restoreNotify';
    notify.style.cssText = 'background-color:#FFF8E1;border:1px solid #FFE082;border-radius:8px;padding:10px 16px;margin-bottom:12px;font-size:0.85rem;color:#795548;display:flex;align-items:center;justify-content:space-between;';
    notify.innerHTML = '<span>📋 已自动恢复之前保存的答案，点击"重做"按钮可清除</span>' +
        '<button onclick="this.parentElement.remove();localStorage.removeItem(\'answers_\' + getPageKey());location.reload();" style="background:#FF6F00;color:#fff;border:none;border-radius:4px;padding:4px 12px;cursor:pointer;font-size:0.8rem;">清除已存答案</button>';

    var questionsList = document.getElementById('questionsList');
    if (questionsList) {
        questionsList.parentNode.insertBefore(notify, questionsList);
    }
}

function getPageKey() {
    return window.location.pathname;
}

function showReference() {
    var refDiv = document.getElementById('referenceAnswer');
    if (refDiv) {
        if (refDiv.style.display === 'none' || refDiv.style.display === '') {
            refDiv.style.display = 'block';
        } else {
            refDiv.style.display = 'none';
        }
    }
}

function toggleExplanation() {
    var explainDiv = document.getElementById('translationExplanation');
    if (explainDiv) {
        if (explainDiv.style.display === 'none' || explainDiv.style.display === '') {
            explainDiv.style.display = 'block';
        } else {
            explainDiv.style.display = 'none';
        }
    }
}