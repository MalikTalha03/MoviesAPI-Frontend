$(document).ready(function () {
  loadmovies();
  var openPopupBtn = $("#openPopupBtn");
  var closePopupBtn = $("#closePopupBtn");
  var popup = $("#popup");
  var submitBtn = $("#submitBtn");

  openPopupBtn.click(function () {
    popup.show();
  });

  closePopupBtn.click(function () {
    popup.hide();
  });

  submitBtn.click(function () {
    if (validateForm()) {
      postdata();
      popup.hide();
    } else {
      alert("Please enter valid data");
    }
  });
});

async function getmovies() {
  try {
    const data = await $.ajax({
      url: "http://localhost:8086/api/movies",
      method: "GET",
      contentType: "application/json",
    });
    $("#container").empty();
    for (const value of data) {
      try {
        const base64String = value.poster;
        const image = await base64toimage(base64String);

        var movies = $(`
                    <div class="card">
                        <img src="" alt="" id="photo">
                        <div class="info">
                            <h3 class="title" id="name"></h3>
                            <p class="year" id="year"></p>
                            <p class="desc" id="genre"></p>
                            <p id="producer"></p>
                            <div class="rating" id="ratingdiv">
                                <div class="text>
                                    <span style='font-size:10px;'>&#11088;</span>
                                    <p class="numeric-rating" id="rating"></p>
                                </div>
                                <div class="edit" id="editdiv">
                                    <button class="movbtn" id="edit">
                                    <svg  xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                        <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                                    </svg>
                                    </button>
                                    <button class="movbtn" id="del">
                                    <svg  xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
                                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
                                    </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>`);
        movies.find(".card").attr("id", value._id)
        movies.find("#photo").attr("src", image.src);
        movies.find("#name").text(value.name);
        movies.find("#year").text(value.year);
        movies.find("#genre").text(value.genre);
        movies.find("#producer").text(value.producer);
        ratingtext = value.rating + "/10";
        movies.find("#rating").text(value.rating + " / 10");
        const editIcon = movies.find("#edit");
        const deleteIcon = movies.find("#del");
        (function (value) {
            editIcon.click(function () {
                var editPopup = $("#editPopup");
                var editCloseBtn = $("#closeEditPopupBtn");
                var editSubmitBtn = $("#editSubmitBtn");
                var editName = $("#editName");
                var editYear = $("#editYear");
                var editGenre = $("#editGenre");
                var editProducer = $("#editProducer");
                var editRating = $("#editRating");
                var editPoster = $("#editPoster");
                editPopup.show();
                editName.val(value.name);
                editYear.val(value.year);
                editGenre.val(value.genre);
                editProducer.val(value.producer);
                editRating.val(value.rating);
                editPoster.val(value.poster);
                editCloseBtn.click(function () {
                    editPopup.hide();
                });
                editSubmitBtn.click(function () {
                    if (validateEditForm()) {
                        editdata(value._id);
                        editPopup.hide();
                    } else {
                        alert("Please enter valid data");
                    }
                });

            });

            deleteIcon.click(function () {
                deletedata(value._id);
            });
        })(value);


        $("#container").append(movies);
      } catch (error) {
        console.error("Error loading image:", error);
      }
    }
  } catch (err) {
    alert("Error" + err);
  }
}

function validateForm() {
  var yearInput = $("#year");
  var yearValue = yearInput.val();
  var yearPattern = /^\d{4}$/;
  if (!yearPattern.test(yearValue)) {
    alert("Please enter exactly 4 digits in the Year field.");
    return false;
  }
  return true;
}

async function postdata() {
  var name = $("#name").val();
  var year = $("#year").val();
  var genre = $("#genre").val();
  var producer = $("#producer").val();
  var rating = $("#rating").val();
  var picture = $("#photo").prop("files")[0];
  var poster = await converttoBase64(picture);
  var movie = {
    name: name,
    year: year,
    genre: genre,
    producer: producer,
    rating: rating,
    poster: poster,
  };
  $.ajax({
    url: "http://localhost:8086/api/movies",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(movie),
    success: function (data) {
        //clear form
        $("#name").val("");
        $("#year").val("");
        $("#genre").val("");
        $("#producer").val("");
        $("#rating").val("");
        loadmovies()
        
      alert("Movie added");
    },
    error: function (err) {
      alert("Error");
    },
  });
}

function converttoBase64(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      maxheight = 140;
      maxwidth = 150;
      var img = new Image();
      img.src = fileReader.result;
      img.onload = () => {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var width = img.width;
        var height = img.height;
        if (width > height) {
          if (width > maxwidth) {
            height *= maxwidth / width;
            width = maxwidth;
          }
        } else {
          if (height > maxheight) {
            width *= maxheight / height;
            height = maxheight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg"));
      };
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}

function base64toimage(base64) {
  return new Promise((resolve, reject) => {
    var img = new Image();
    img.src = base64;
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (error) => {
      reject(error);
    };
  });
}

async function loadmovies() {
  try {
    await getmovies();
  } catch (err) {
    alert("Error");
  }
}

async function editdata(id) {
  var name = $("#editName").val();
  var year = $("#editYear").val();
  var genre = $("#editGenre").val();
  var producer = $("#editProducer").val();
  var rating = $("#editRating").val();
  var picture = $("#editPoster").prop("files")[0];
  var poster = await converttoBase64(picture);
  var movie = {
    name: name,
    year: year,
    genre: genre,
    producer: producer,
    rating: rating,
    poster: poster,
  };
  $.ajax({
    url: "http://localhost:8086/api/movies/" + id,
    method: "PATCH",
    contentType: "application/json",
    data: JSON.stringify(movie),
    success: function (data) {
      loadmovies()
      alert("Movie updated");
    },
    error: function (err) {
      alert("Error");
    },
  });
}

async function deletedata(id) {
  $.ajax({
    url: "http://localhost:8086/api/movies/" + id,
    method: "DELETE",
    contentType: "application/json",
    success: function (data) {
      alert("Movie deleted");
      loadmovies()
    },
    error: function (err) {
      alert("Error");
    },
  });
}

function validateEditForm() {
  var yearInput = $("#editYear");
  var yearValue = yearInput.val();
  var yearPattern = /^\d{4}$/;
  if (!yearPattern.test(yearValue)) {
    alert("Please enter exactly 4 digits in the Year field.");
    return false;
  }
  return true;
}