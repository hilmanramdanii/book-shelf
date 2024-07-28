document.addEventListener('DOMContentLoaded', function () {
  const bookForm = document.getElementById('bookForm');
  const bookFormTitle = document.getElementById('bookFormTitle');
  const bookFormAuthor = document.getElementById('bookFormAuthor');
  const bookFormYear = document.getElementById('bookFormYear');
  const bookFormIsComplete = document.getElementById('bookFormIsComplete');
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');
  const searchBook = document.getElementById('searchBook');
  const searchBookTitle = document.getElementById('searchBookTitle');

  let books = JSON.parse(localStorage.getItem('books')) || [];
  let bookId = books.length ? books[books.length - 1].id : 0;
  let editingBookId = null;

  bookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validateForm()) {
      Swal.fire('Error', 'Semua field harus diisi dengan benar!', 'error');
      return;
    }
    if (editingBookId !== null) {
      updateBook(editingBookId);
    } else {
      addBook();
    }
  });

  searchBook.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBooks();
  });

  function validateForm() {
    if (!bookFormTitle.value || !bookFormAuthor.value || !bookFormYear.value) {
      return false;
    }
    if (isNaN(parseInt(bookFormYear.value, 10)) || parseInt(bookFormYear.value, 10) <= 0) {
      return false;
    }
    return true;
  }

  function addBook() {
    const title = bookFormTitle.value;
    const author = bookFormAuthor.value;
    const year = parseInt(bookFormYear.value, 10);
    const isComplete = bookFormIsComplete.checked;
    const id = ++bookId;

    const book = { id, title, author, year, isComplete };
    books.push(book);

    displayBooks();
    saveBooks();
    resetForm();

    Swal.fire(
      'Buku Berhasil Ditambahkan',
      isComplete ? 'Buku berhasil ditambahkan ke rak selesai dibaca' : 'Buku berhasil ditambahkan ke rak belum selesai dibaca',
      'success'
    );
  }

  function updateBook(bookId) {
    const book = books.find(book => book.id === bookId);
    if (book) {
      book.title = bookFormTitle.value;
      book.author = bookFormAuthor.value;
      book.year = parseInt(bookFormYear.value, 10);
      book.isComplete = bookFormIsComplete.checked;
    }

    displayBooks();
    saveBooks();
    resetForm();
    editingBookId = null;

    Swal.fire(
      'Buku Berhasil Diedit',
      'Buku berhasil diedit dengan informasi baru.',
      'success'
    );
  }

  function displayBooks() {
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    for (const book of books) {
      const bookElement = createBookElement(book);
      if (book.isComplete) {
        completeBookList.appendChild(bookElement);
      } else {
        incompleteBookList.appendChild(bookElement);
      }
    }
  }

  function createBookElement(book) {
    const bookItem = document.createElement('div');
    bookItem.setAttribute('data-bookid', book.id);
    bookItem.setAttribute('data-testid', 'bookItem');
    bookItem.classList.add('book-item');

    const bookTitle = document.createElement('h3');
    bookTitle.setAttribute('data-testid', 'bookItemTitle');
    bookTitle.textContent = book.title;

    const bookAuthor = document.createElement('p');
    bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
    bookAuthor.textContent = `Penulis: ${book.author}`;

    const bookYear = document.createElement('p');
    bookYear.setAttribute('data-testid', 'bookItemYear');
    bookYear.textContent = `Tahun: ${book.year}`;

    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action-container');

    const isCompleteButton = document.createElement('button');
    isCompleteButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    isCompleteButton.textContent = book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
    isCompleteButton.addEventListener('click', function () {
      toggleBookCompleteStatus(book.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.textContent = 'Hapus';
    deleteButton.addEventListener('click', function () {
      Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Anda tidak akan dapat mengembalikan ini!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, hapus!'
      }).then((result) => {
        if (result.value) {
          deleteBook(book.id);
          Swal.fire('Terhapus!', 'Buku berhasil dihapus.', 'success');
        }
      });
    });

    const editButton = document.createElement('button');
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', function () {
      editBook(book.id);
    });

    actionContainer.appendChild(isCompleteButton);
    actionContainer.appendChild(deleteButton);
    actionContainer.appendChild(editButton);

    bookItem.appendChild(bookTitle);
    bookItem.appendChild(bookAuthor);
    bookItem.appendChild(bookYear);
    bookItem.appendChild(actionContainer);

    return bookItem;
  }

  function resetForm() {
    bookFormTitle.value = '';
    bookFormAuthor.value = '';
    bookFormYear.value = '';
    bookFormIsComplete.checked = false;
    editingBookId = null;
  }

  function toggleBookCompleteStatus(bookId) {
    const book = books.find(book => book.id === bookId);
    if (book) {
      book.isComplete = !book.isComplete;
      displayBooks();
      saveBooks();

      Swal.fire(
        'Status Buku Diubah',
        book.isComplete ? 'Buku berhasil dipindahkan ke rak selesai dibaca' : 'Buku berhasil dipindahkan ke rak belum selesai dibaca',
        'success'
      );
    }
  }

  function deleteBook(bookId) {
    books = books.filter(book => book.id !== bookId);
    displayBooks();
    saveBooks();
  }

  function editBook(bookId) {
    const book = books.find(book => book.id === bookId);
    if (book) {
      bookFormTitle.value = book.title;
      bookFormAuthor.value = book.author;
      bookFormYear.value = book.year;
      bookFormIsComplete.checked = book.isComplete;

      editingBookId = bookId;
    }
  }

  function searchBooks() {
    const query = searchBookTitle.value.toLowerCase();
    const filteredBooks = books.filter(book => book.title.toLowerCase().includes(query));

    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    for (const book of filteredBooks) {
      const bookElement = createBookElement(book);
      if (book.isComplete) {
        completeBookList.appendChild(bookElement);
      } else {
        incompleteBookList.appendChild(bookElement);
      }
    }
  }

  function saveBooks() {
    localStorage.setItem('books', JSON.stringify(books));
  }

  function loadBooks() {
    books = JSON.parse(localStorage.getItem('books')) || [];
    bookId = books.length ? books[books.length - 1].id : 0;
    displayBooks();
  }

  loadBooks();
});
