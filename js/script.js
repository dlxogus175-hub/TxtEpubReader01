const library =
    document.getElementById(
        "library"
    );

const folderInput =
    document.getElementById(
        "folderInput"
    );

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

        if (files.length === 0)
            return;

        const txtFiles =
            files.filter(file =>
                file.name.endsWith(
                    ".txt"
                )
            );

        if (txtFiles.length === 0)
            return;

        const firstPath =
            txtFiles[0]
                .webkitRelativePath;

        const bookName =
            firstPath.split("/")[0];

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "book-card";

        card.innerHTML = `

            <div class="book-info">

                <div class="book-title">
                    ${bookName}
                </div>

                <div class="book-count">
                    ${txtFiles.length}화
                </div>

            </div>
        `;

        card.onclick = () => {

            openBook(
                bookName,
                txtFiles
            );

        };

        library.appendChild(card);

    }
);

/* 작품 열기 */

function openBook(
    title,
    files
) {

    files.sort((a, b) => {

        return parseInt(a.name)
            - parseInt(b.name);

    });

    library.innerHTML = `

        <div class="chapter-page">

            <button
                class="back-btn"
                onclick="location.reload()"
            >
                ← 뒤로
            </button>

            <h2 class="chapter-title">
                ${title}
            </h2>

            <div id="chapterList"></div>

        </div>
    `;

    const chapterList =
        document.getElementById(
            "chapterList"
        );

    files.forEach((file, index) => {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "chapter-item";

        item.textContent =
            file.name;

        item.onclick =
            async () => {

                const text =
                    await file.text();

                openReader(
                    title,
                    files,
                    index,
                    text
                );

            };

        chapterList.appendChild(
            item
        );

    });

}

/* 설정값 */

let fontSize = 18;

let lineHeight = 2.1;

let readerWidth = 760;

let backgroundColor =
    "#ffffff";

let uiVisible = false;

/* 리더 */

function openReader(
    bookTitle,
    files,
    currentIndex,
    text
) {

    const formattedText =

        text

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

    window.addEventListener(
        "scroll",
        updateProgress
    );

    updateProgress();

}

/* 화 이동 */
/* 화 이동 확인 */
async function moveChapter(
    index
) {

    const file =
        window.currentFiles[index];

    const text =
        await file.text();

    openReader(
        window.currentBook,
        window.currentFiles,
        index,
        text
    );

    window.scrollTo({

        top: 0,

        behavior: "instant"

    });

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

/* 줄 */

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

    const panel =
        document.getElementById(
            "settingsPanel"
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

        if (panel) {

            panel.classList.remove(
                "open"
            );

        }

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

/* 검색 */

document.addEventListener(
    "input",
    (e) => {

        if (
            e.target.id
            !== "searchInput"
        ) return;

        const keyword =
            e.target.value
                .toLowerCase();

        const cards =
            document.querySelectorAll(
                ".book-card"
            );

        cards.forEach(card => {

            const title =
                card
                    .querySelector(
                        ".book-title"
                    )
                    .textContent
                    .toLowerCase();

            if (
                title.includes(
                    keyword
                )
            ) {

                card.style.display =
                    "flex";

            } else {

                card.style.display =
                    "none";

            }

        });

    }
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

            top: moveY,

        });

    }
);

let draggingProgress =
    false;

document.addEventListener(
    "pointerdown",
    (e) => {

        const bar =
            document.getElementById(
                "progressBar"
            );

        if (
            e.target === bar
        ) {

            draggingProgress =
                true;

        }

    }
);

document.addEventListener(
    "pointermove",
    (e) => {

        if (
            !draggingProgress
        ) return;

        const bar =
            document.getElementById(
                "progressBar"
            );

        if (!bar) return;

        const rect =
            bar.getBoundingClientRect();

        let x =
            e.clientX - rect.left;

        x =
            Math.max(
                0,
                Math.min(
                    rect.width,
                    x
                )
            );

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

document.addEventListener(
    "pointerup",
    () => {

        draggingProgress =
            false;

    }
);