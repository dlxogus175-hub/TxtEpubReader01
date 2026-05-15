const library =
    document.getElementById("library");

const folderInput =
    document.getElementById("folderInput");

/* 폴더 선택 */

function openFolderPicker() {

    folderInput.value = "";

    folderInput.click();
}

/* 폴더 업로드 */

folderInput.addEventListener(
    "change",
    async (e) => {

        const files =
            [...e.target.files];

        if (files.length === 0) return;

        // txt 추출

        const txtFiles =
            files.filter(file =>
                file.name.endsWith(".txt")
            );

        if (txtFiles.length === 0) return;

        // 작품명

        const firstPath =
            txtFiles[0]
                .webkitRelativePath;

        const bookName =
            firstPath.split("/")[0];

        // 표지 찾기

        const coverFile =
            files.find(file =>

                file.name.toLowerCase() === "cover.jpg"
                ||
                file.name.toLowerCase() === "cover.png"
                ||
                file.name.toLowerCase() === "cover.jpeg"
                ||
                file.name.toLowerCase() === "cover.webp"



            );

        let coverURL = "";

        if (coverFile) {

            coverURL =
                URL.createObjectURL(
                    coverFile
                );
        }

        // 카드 생성

        const card =
            document.createElement("div");

        card.className =
            "book-card";

        card.innerHTML = `
      <img
        class="book-cover"
        src="${coverURL || ""}"
      >

      <div class="book-info">

        <div class="book-title">
          ${bookName}
        </div>

        <div class="book-count">
          ${txtFiles.length}화
        </div>

      </div>
    `;

        // 클릭

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
            document.createElement("div");

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

        chapterList
            .appendChild(item);

    });

}

/* 리더 설정값 */

let fontSize = 18;

let lineHeight = 2.1;

let readerWidth = 760;

let backgroundColor = "#f4efe6";

let uiVisible = false;

/* 리더 열기 */

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

    <!-- 상단 UI -->

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

    <!-- 설정창 -->

    <div
      class="settings-panel"
      id="settingsPanel"
    >

      <div class="setting-row">

        <span>글자 크기</span>

        <div>

          <button onclick="fontDown()">-</button>

          <button onclick="fontUp()">+</button>

        </div>

      </div>

      <div class="setting-row">

        <span>줄 간격</span>

        <div>

          <button onclick="lineDown()">-</button>

          <button onclick="lineUp()">+</button>

        </div>

      </div>

      <div class="setting-row">

        <span>문단 너비</span>

        <div>

          <button onclick="widthDown()">-</button>

          <button onclick="widthUp()">+</button>

        </div>

      </div>

      <div class="setting-row">

        <span>배경 색</span>

        <div class="color-buttons">

          <button
            class="color-btn white-theme"
            onclick="changeBackground('#ffffff')"
          ></button>

          <button
            class="color-btn green-theme"
            onclick="changeBackground('#c3dda8')"
          ></button>

        </div>

      </div>

    </div>

    <!-- 리더 -->

    <div
      class="reader"
      id="reader"
      onclick="toggleReaderUI()"
    >

      <div class="text-content">
        ${formattedText}
      </div>

    </div>

    <!-- 하단 UI -->

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

        <div class="progress-bar">

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

    updateReaderStyle();

    window.addEventListener(
        "scroll",
        updateProgress
    );

    updateProgress();

}

/* 다음 화 이동 */

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

}

/* 설정창 */

function toggleSettings() {

    const panel =
        document.getElementById(
            "settingsPanel"
        );

    panel.classList.toggle("open");

}

/* 글자 크기 */

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

/* 배경색 */

function changeBackground(color) {

    backgroundColor = color;

    updateReaderStyle();

}

/* 스타일 적용 */

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

    const top =
        document.getElementById(
            "readerTop"
        );

    if (top) {

        top.style.background =
            backgroundColor;
    }

    const bottom =
        document.getElementById(
            "readerBottom"
        );

    if (bottom) {

        bottom.style.background =
            backgroundColor;
    }

}

/* UI 표시 */

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
                (scrollTop / docHeight)
                * 100
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