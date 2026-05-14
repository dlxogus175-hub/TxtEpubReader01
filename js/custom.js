const library = document.getElementById("library");

const reader = document.getElementById("reader");

const sidebar = document.getElementById("sidebar");

const folderInput = document.getElementById("folderInput");

let fontSize = 18;

let lineHeight = 2.1;

/* 작품 폴더 선택 */

function openFolderPicker() {

    folderInput.value = "";

    folderInput.click();
}

/* 폴더 업로드 */

folderInput.addEventListener("change", async (e) => {

    const files = [...e.target.files];

    if (files.length === 0) return;

    // txt만 필터

    const txtFiles = files.filter(file =>
        file.name.endsWith(".txt")
    );

    if (txtFiles.length === 0) return;

    // 작품명 가져오기

    const firstPath =
        txtFiles[0].webkitRelativePath;

    const bookName =
        firstPath.split("/")[0];

    // 작품 생성

    const bookId =
        "book_" + Date.now();

    const book = document.createElement("div");

    book.className = "book";

    book.innerHTML = `
    <div
      class="book-header"
      onclick="toggleBook('${bookId}')"
    >

      <div class="book-title">
        ${bookName}
      </div>

      <div>▼</div>

    </div>

    <div
      class="chapter-list"
      id="${bookId}"
    ></div>
  `;

    library.appendChild(book);

    const chapterList =
        document.getElementById(bookId);

    // 숫자 정렬

    txtFiles.sort((a, b) => {

        return parseInt(a.name)
            - parseInt(b.name);

    });

    // 챕터 추가

    for (const file of txtFiles) {

        const text =
            await file.text();

        const chapter =
            document.createElement("div");

        chapter.className = "chapter";

        chapter.textContent = file.name;

        chapter.onclick = () => {

            loadText(text);

            if (window.innerWidth <= 768) {

                sidebar.classList.remove("open");
            }
        };

        chapterList.appendChild(chapter);

    }

});

/* 작품 접기 */

function toggleBook(id) {

    const target =
        document.getElementById(id);

    if (target.style.display === "block") {

        target.style.display = "none";

    } else {

        target.style.display = "block";
    }

}

/* txt 출력 */

function loadText(text) {

    const paragraphs =
        text
            .trim()
            .split("\n\n");

    reader.innerHTML =
        paragraphs
            .map(p => `<p>${p}</p>`)
            .join("");

}

/* 글자 크기 */

function fontUp() {

    fontSize += 2;

    reader.style.fontSize =
        fontSize + "px";
}

function fontDown() {

    fontSize -= 2;

    reader.style.fontSize =
        fontSize + "px";
}

/* 줄간격 */

function lineUp() {

    lineHeight += 0.1;

    reader.style.lineHeight =
        lineHeight;
}

function lineDown() {

    lineHeight -= 0.1;

    reader.style.lineHeight =
        lineHeight;
}

/* 다크모드 */

function toggleDarkMode() {

    document.body
        .classList
        .toggle("dark");
}

/* 모바일 메뉴 */

function toggleSidebar() {

    sidebar
        .classList
        .toggle("open");
}