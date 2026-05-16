const originalBody =
    document.body.innerHTML;


let library =
    document.getElementById(
        "library"
    );

let folderInput =
    document.getElementById(
        "folderInput"
    );





/* IndexedDB */

let db;

const request =
    indexedDB.open(
        "LibraryDB",
        1
    );

request.onupgradeneeded =
    (e) => {

        db =
            e.target.result;

        db.createObjectStore(
            "books",
            {
                keyPath: "name"
            }
        );

    };

request.onsuccess =
    (e) => {

        db =
            e.target.result;

        loadBooks();

    };

/* 설정값 */

let fontSize = 18;

let lineHeight = 2.1;

let readerWidth = 760;

let backgroundColor =
    "#ffffff";

let uiVisible = false;

let draggingProgress =
    false;

/* 폴더 선택 */

function openFolderPicker() {

    folderInput.value = "";

    folderInput.click();

}

/* 업로드 */

folderInput.addEventListener(
    "change",
    async (e) => {

        const files =
            [...e.target.files];

        if (
            files.length === 0
        ) return;

        const txtFiles =
            files.filter(file =>
                file.name.endsWith(
                    ".txt"
                )
            );

        const infoFile =
            txtFiles.find(file =>
                file.name === "info.txt"
            );

        let description = "";

        if (infoFile) {

            description =
                await infoFile.text();

        }

        if (
            txtFiles.length === 0
        ) return;

        const firstPath =
            txtFiles[0]
                .webkitRelativePath;

        const bookName =
            firstPath.split("/")[0];

        const chapters = [];

        const chapterFiles =
            txtFiles.filter(file =>
                file.name !== "info.txt"
            );

        for (const file of chapterFiles) {

            const text =
                await file.text();

            chapters.push({

                name:
                    file.name,

                text:
                    text

            });

        }

        saveBook(
            bookName,
            chapters,
            description
        );

        createBookCard(
            bookName,
            chapters,
            description
        );

    }
);

/* 작품 카드 */

function createBookCard(
    bookName,
    chapters,
    description
) {

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "book-card";

    card.draggable = true;

    card.dataset.name =
        bookName;

    card.innerHTML = `

        <div class="drag-handle">
            ☰
        </div>

        <div class="book-info">

            <div class="book-title">
                ${bookName}
            </div>

            <div class="book-count">
                ${chapters.length}화
            </div>

        </div>

        <button
            class="library-delete-btn"
        >
            삭제
        </button>

    `;

    /* 작품 열기 */

    card.querySelector(
        ".book-info"
    ).onclick = () => {

        openBook(
            bookName,
            chapters,
            description
        );

    };

    /* 삭제 */

    card.querySelector(
        ".library-delete-btn"
    ).onclick = (e) => {

        e.stopPropagation();

        deleteBook(
            bookName
        );

    };

    /* 드래그 */

    card.addEventListener(
        "dragstart",
        () => {

            card.classList.add(
                "dragging"
            );

        }
    );

    card.addEventListener(
        "dragend",
        () => {

            card.classList.remove(
                "dragging"
            );

            saveBookOrder();

        }
    );

    library.appendChild(card);

}

/* 작품 저장 */

function saveBook(
    bookName,
    chapters,
    description
) {

    const tx =
        db.transaction(
            "books",
            "readwrite"
        );

    const store =
        tx.objectStore(
            "books"
        );

    store.put({

        name:
            bookName,

        chapters:
            chapters,

        description:
            description

    });

}

/* 작품 불러오기 */

/* 작품 불러오기 */

function loadBooks() {

    const tx =
        db.transaction(
            "books",
            "readonly"
        );

    const store =
        tx.objectStore(
            "books"
        );

    const request =
        store.getAll();

    request.onsuccess =
        () => {

            library.innerHTML = "";

            request.result.forEach(
                book => {

                    createBookCard(
                        book.name,
                        book.chapters,
                        book.description
                    );

                }
            );

            applyBookOrder();

        };

}

/* 작품 열기 */

function openBook(
    title,
    chapters,
    description
) {

    chapters.sort((a, b) => {

        return parseInt(a.name)
            - parseInt(b.name);

    });

    library.innerHTML = `

<div class="chapter-page">

    <div class="chapter-top">

        <button
            class="back-library-btn"
            onclick="goLibrary()"
        >
            ← 뒤로
        </button>

        <button
            class="delete-book-btn"
            onclick="
                deleteBook(
                    '${title}'
                )
            "
        >
            삭제
        </button>

    </div>

    <h2 class="chapter-title">
        ${title}
    </h2>

    <div class="book-info-box">

        <div class="book-info-title">
            작품 소개
        </div>

        <div class="book-description">

            ${description || "소개글 없음"}

        </div>

    </div>

    <div class="chapter-divider"></div>

    <div class="chapter-list-title">
        목차
    </div>

    <div id="chapterList"></div>

    </div>

    `;

    const chapterList =
        document.getElementById(
            "chapterList"
        );

    chapters.forEach(
        (chapter, index) => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "chapter-item";

            item.innerHTML = `

            <span>
            ${chapter.name}
            </span>

            <span class="chapter-arrow">
            ›
            </span>

            `;

            item.onclick =
                () => {

                    openReader(
                        title,
                        chapters,
                        index,
                        chapter.text
                    );

                };

            chapterList.appendChild(
                item
            );

        }
    );

}

/* 리더 */

function openReader(
    bookTitle,
    files,
    currentIndex,
    text
) {

    const cleanedText =

        text

            .replace(
                /^.*===== iframe:.*$/gim,
                ""
            )

            .replace(
                /^.*googleads.*$/gim,
                ""
            )

            .replace(
                /^.*recaptcha.*$/gim,
                ""
            );

    const formattedText =

        cleanedText

            .replace(/\r/g, "")

            .replace(/\n/g, "<br>");

    document.body.innerHTML = `

<div
    class="reader-top hidden-ui"
    id="readerTop"
>

    <button
        class="back-btn"
        onclick="location.reload()"
    >
        ← 뒤로
    </button>

    <button
        class="setting-btn"
        onclick="toggleSettings()"
    >
        Aa
    </button>

</div>
<div
    class="settings-panel"
    id="settingsPanel"
>

    <div class="setting-row">

        <span>글자</span>

        <div>

            <button onclick="fontDown()">
                -
            </button>

            <button onclick="fontUp()">
                +
            </button>

        </div>

    </div>

    <div class="setting-row">

        <span>줄 간격</span>

        <div>

            <button onclick="lineDown()">
                -
            </button>

            <button onclick="lineUp()">
                +
            </button>

        </div>

    </div>

    <div class="setting-row">

        <span>너비</span>

        <div>

            <button onclick="widthDown()">
                -
            </button>

            <button onclick="widthUp()">
                +
            </button>

        </div>

    </div>

    <div class="setting-row background-row">

        <span>배경</span>

        <div class="color-buttons">

            <button
                class="
                    color-btn
                    white-theme
                "
                onclick="
                    changeBackground(
                        '#ffffff'
                    )
                "
            ></button>

            <button
                class="
                    color-btn
                    green-theme
                "
                onclick="
                    changeBackground(
                        '#c3dda8'
                    )
                "

                
            ></button>

            
        </div>

    </div>

</div>



<div
    class="reader"
    id="reader"
>

    <div
        class="touch-zone left-zone"
        onclick="
            askMoveChapter(
                ${currentIndex - 1}
            )
        "
    ></div>

    <div
        class="touch-zone right-zone"
        onclick="
            askMoveChapter(
                ${currentIndex + 1}
            )
        "
    ></div>

    <div
        class="text-content"
        onclick="toggleReaderUI()"
    >

        ${formattedText}

    </div>

    ${currentIndex !==
            files.length - 1

            ?

            `

        <button
            class="next-chapter-btn"
            onclick="
                moveChapter(
                    ${currentIndex + 1}
                )
            "
        >

            다음 화 보기 →

        </button>

        `

            :

            ""
        }

</div>

<div
    class="reader-bottom hidden-ui"
    id="readerBottom"
>

    <button
        class="nav-arrow"
        onclick="
            moveChapter(
                ${currentIndex - 1}
            )
        "
        ${currentIndex === 0
            ? "disabled"
            : ""
        }
    >
        ←
    </button>

    <div class="progress-area">

        <div
            class="progress-text"
            id="progressText"
        >
            0%
        </div>

        <div
            class="progress-bar"
            id="progressBar"
        >

            <div
                class="progress-fill"
                id="progressFill"
            ></div>

        </div>

    </div>

    <button
        class="nav-arrow"
        onclick="
            moveChapter(
                ${currentIndex + 1}
            )
        "
        ${currentIndex ===
            files.length - 1
            ? "disabled"
            : ""
        }
    >
        →
    </button>

</div>

    `;

    window.currentBook =
        bookTitle;

    window.currentFiles =
        files;

    window.currentIndex =
        currentIndex;

    updateReaderStyle();

    window.scrollTo(
        0,
        0
    );

    updateProgress();

}

/* 화 이동 */

function moveChapter(
    index
) {

    if (
        index < 0
        ||
        index >=
        window.currentFiles.length
    ) return;

    const file =
        window.currentFiles[index];

    openReader(
        window.currentBook,
        window.currentFiles,
        index,
        file.text
    );

}

/* 화 이동 확인 */

function askMoveChapter(
    index
) {

    if (
        index < 0
        ||
        index >=
        window.currentFiles.length
    ) return;

    const isNext =
        index >
        window.currentIndex;

    const ok =
        confirm(

            isNext

                ?

                "다음 화로 이동"

                :

                "이전 화로 이동"

        );

    if (ok) {

        moveChapter(index);

    }

}

/* 설정창 */

function toggleSettings() {

    const panel =
        document.getElementById(
            "settingsPanel"
        );

    panel.classList.toggle(
        "open"
    );

}



/* 글자 */

function fontUp() {

    fontSize += 2;

    updateReaderStyle();

}

function fontDown() {

    fontSize -= 2;

    updateReaderStyle();

}

/* 줄 간격 */

function lineUp() {

    lineHeight += 0.1;

    updateReaderStyle();

}

function lineDown() {

    lineHeight -= 0.1;

    updateReaderStyle();

}

/* 너비 */

function widthUp() {

    readerWidth += 60;

    updateReaderStyle();

}

function widthDown() {

    readerWidth -= 60;

    updateReaderStyle();

}

/* 배경 */

function changeBackground(
    color
) {

    backgroundColor = color;

    updateReaderStyle();

}

/* 스타일 */

function updateReaderStyle() {

    const reader =
        document.getElementById(
            "reader"
        );

    if (!reader) return;

    reader.style.fontSize =
        fontSize + "px";

    reader.style.lineHeight =
        lineHeight;

    reader.style.maxWidth =
        readerWidth + "px";

    reader.style.background =
        backgroundColor;

    document.body.style.background =
        backgroundColor;

}

/* 스타일 */

function updateReaderStyle() {

    const reader =
        document.getElementById(
            "reader"
        );

    if (!reader) return;

    reader.style.fontSize =
        fontSize + "px";

    reader.style.lineHeight =
        lineHeight;

    reader.style.maxWidth =
        readerWidth + "px";

    reader.style.background =
        backgroundColor;

    document.body.style.background =
        backgroundColor;

}

/* UI */

function toggleReaderUI() {

    uiVisible = !uiVisible;

    const top =
        document.getElementById(
            "readerTop"
        );

    const bottom =
        document.getElementById(
            "readerBottom"
        );

    if (uiVisible) {

        top.classList.remove(
            "hidden-ui"
        );

        bottom.classList.remove(
            "hidden-ui"
        );

    } else {

        top.classList.add(
            "hidden-ui"
        );

        bottom.classList.add(
            "hidden-ui"
        );

    }

}

/* 진행률 */

function updateProgress() {

    const scrollTop =
        window.scrollY;

    const docHeight =
        document.body.scrollHeight
        - window.innerHeight;

    const progress =
        Math.min(
            100,
            Math.round(
                (
                    scrollTop
                    / docHeight
                ) * 100
            )
        );

    const text =
        document.getElementById(
            "progressText"
        );

    const fill =
        document.getElementById(
            "progressFill"
        );

    if (text) {

        text.textContent =
            progress + "%";

    }

    if (fill) {

        fill.style.width =
            progress + "%";

    }

}

/* 스크롤 이벤트 */

window.addEventListener(
    "scroll",
    updateProgress
);

/* 진행률 클릭 이동 */

document.addEventListener(
    "click",
    (e) => {

        const bar =
            document.getElementById(
                "progressBar"
            );

        if (!bar) return;

        if (
            !bar.contains(
                e.target
            )
        ) return;

        const rect =
            bar.getBoundingClientRect();

        const x =
            e.clientX - rect.left;

        const ratio =
            x / rect.width;

        const moveY =

            (
                document.body.scrollHeight
                - window.innerHeight
            )

            * ratio;

        window.scrollTo({

            top: moveY

        });

    }
);







/* 작품 삭제 함수 */

function deleteBook(
    bookName
) {

    const ok =
        confirm(
            "작품을 삭제할까요?"
        );

    if (!ok) return;

    const tx =
        db.transaction(
            "books",
            "readwrite"
        );

    const store =
        tx.objectStore(
            "books"
        );

    store.delete(bookName);

    location.reload();

}







/* 드래그 정렬 */

library.addEventListener(
    "dragover",
    (e) => {

        e.preventDefault();

        const dragging =
            document.querySelector(
                ".dragging"
            );

        const cards =
            [
                ...document.querySelectorAll(
                    ".book-card:not(.dragging)"
                )
            ];

        const nextCard =
            cards.find(card => {

                const rect =
                    card.getBoundingClientRect();

                return (
                    e.clientY
                    <
                    rect.top
                    +
                    rect.height / 2
                );

            });

        if (nextCard) {

            library.insertBefore(
                dragging,
                nextCard
            );

        } else {

            library.appendChild(
                dragging
            );

        }

    }
);

/* 순서 저장 */

function saveBookOrder() {

    const order =
        [
            ...document.querySelectorAll(
                ".book-card"
            )
        ].map(card =>

            card.dataset.name

        );

    localStorage.setItem(
        "bookOrder",
        JSON.stringify(order)
    );

}

/* 순서 적용 */

function applyBookOrder() {

    const order =
        JSON.parse(
            localStorage.getItem(
                "bookOrder"
            )
        );

    if (!order) return;

    order.forEach(name => {

        const card =
            document.querySelector(
                `.book-card[data-name="${name}"]`
            );

        if (card) {

            library.appendChild(
                card
            );

        }

    });

}





/* 서재로 */

function goLibrary() {

    document.body.innerHTML =
        originalBody;

    /* DOM 다시 연결 */

    library =
        document.getElementById(
            "library"
        );

    folderInput =
        document.getElementById(
            "folderInput"
        );

    /* 업로드 이벤트 다시 연결 */

    folderInput.addEventListener(
        "change",
        async (e) => {

            const files =
                [...e.target.files];

            if (
                files.length === 0
            ) return;

            const txtFiles =
                files.filter(file =>
                    file.name.endsWith(
                        ".txt"
                    )
                );

            const infoFile =
                txtFiles.find(file =>
                    file.name === "info.txt"
                );

            let description = "";

            if (infoFile) {

                description =
                    await infoFile.text();

            }

            if (
                txtFiles.length === 0
            ) return;

            const firstPath =
                txtFiles[0]
                    .webkitRelativePath;

            const bookName =
                firstPath.split("/")[0];

            const chapters = [];

            const chapterFiles =
                txtFiles.filter(file =>
                    file.name !== "info.txt"
                );

            for (const file of chapterFiles) {

                const text =
                    await file.text();

                chapters.push({

                    name:
                        file.name,

                    text:
                        text

                });

            }

            saveBook(
                bookName,
                chapters,
                description
            );

            createBookCard(
                bookName,
                chapters,
                description
            );

        }
    );

    /* 드래그 다시 연결 */

    library.addEventListener(
        "dragover",
        (e) => {

            e.preventDefault();

            const dragging =
                document.querySelector(
                    ".dragging"
                );

            const cards =
                [
                    ...document.querySelectorAll(
                        ".book-card:not(.dragging)"
                    )
                ];

            const nextCard =
                cards.find(card => {

                    const rect =
                        card.getBoundingClientRect();

                    return (
                        e.clientY
                        <
                        rect.top
                        +
                        rect.height / 2
                    );

                });

            if (nextCard) {

                library.insertBefore(
                    dragging,
                    nextCard
                );

            } else {

                library.appendChild(
                    dragging
                );

            }

        }
    );

    loadBooks();

}