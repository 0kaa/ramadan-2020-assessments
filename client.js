const listOfVidsElm = document.getElementById("listOfRequests");
let sortBy = "newFirst";
let searchTerm = "";
function renderSingleVidReq(vidInfo, isPrepend = false) {
  const vidReqContainerElm = document.createElement("div");
  vidReqContainerElm.classList.add("card");

  vidReqContainerElm.innerHTML = `
  <div class="card mb-3">
  <div class="card-body d-flex justify-content-between flex-row">
    <div class="d-flex flex-column">
      <h3>${vidInfo.topic_title}</h3>
      <p class="text-muted mb-2">${vidInfo.topic_details}</p>
      <p class="mb-0 text-muted">
        ${
          vidInfo.expected_result &&
          `<strong>Expected results:</strong> ${vidInfo.expected_result}`
        }
      </p>
    </div>
    <div class="d-flex flex-column text-center">
      <a id="votes_ups_${vidInfo._id}" class="btn btn-link">🔺</a>
      <h3 id="score_vote_${vidInfo._id}">${
    vidInfo.votes.ups - vidInfo.votes.downs
  }</h3>
      <a id="votes_downs_${vidInfo._id}" class="btn btn-link">🔻</a>
    </div>
  </div>
  <div class="card-footer d-flex flex-row justify-content-between">
    <div>
      <span class="text-info">${vidInfo.status.toUpperCase()}</span>
      &bullet; added by <strong>${vidInfo.author_name}</strong> on
      <strong>${new Date(vidInfo.submit_date).toLocaleDateString()}</strong>
    </div>
    <div
      class="d-flex justify-content-center flex-column 408ml-auto mr-2"
    >
      <div class="badge badge-success">
        ${vidInfo.target_level.toUpperCase()}
      </div>
    </div>
  </div>
  </div>
  `;
  if (isPrepend == true) {
    listOfVidsElm.prepend(vidReqContainerElm);
  } else {
    listOfVidsElm.appendChild(vidReqContainerElm);
  }

  const voteUpsElm = document.getElementById(`votes_ups_${vidInfo._id}`);
  const scoreVoteElm = document.getElementById(`score_vote_${vidInfo._id}`);
  const voteDownsElm = document.getElementById(`votes_downs_${vidInfo._id}`);

  voteUpsElm.addEventListener("click", (e) => {
    // Vote Ups Function
    fetch("http://localhost:7777/video-request/vote", {
      method: "PUT",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({ id: vidInfo._id, vote_type: "ups" }),
    })
      .then((response) => response.json())
      .then((data) => {
        scoreVoteElm.innerText = data.ups - data.downs;
      });
  });

  voteDownsElm.addEventListener("click", (e) => {
    // Vote Downs Function
    fetch("http://localhost:7777/video-request/vote", {
      method: "PUT",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({ id: vidInfo._id, vote_type: "downs" }),
    })
      .then((response) => response.json())
      .then((data) => {
        scoreVoteElm.innerText = data.ups - data.downs;
      });
  });
} // End of renderSingleVidReq Function

function loadAllVidReq() {
  fetch(
    `http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}`
  )
    .then((response) => response.json())
    .then((data) => {
      listOfVidsElm.innerHTML = "";
      data.forEach((vidInfo) => {
        renderSingleVidReq(vidInfo);
      });
    });
}

function debounce(fn, time) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), time);
  };
}


function isValidate(formData) {
  const name = formData.get('author_name');
  const email = formData.get('author_email');
  const topic_title = formData.get('topic_title');
  const topic_details = formData.get('topic_details');
  const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!name) {
    document.querySelector('[name="author_name"]').classList.add('is-invalid');
  }
  if (!email || !emailPattern.test(email)) {
    document.querySelector('[name="author_email"]').classList.add('is-invalid');
  }
  if (!topic_title) {
    document.querySelector('[name="topic_title"]').classList.add('is-invalid');
  }
  if (!topic_details) {
    document.querySelector('[name="topic_details"]').classList.add('is-invalid');
  }
  const allInvalidElms = document.getElementById('formVideoRequest').querySelectorAll('.is-invalid');
  if (allInvalidElms.length) {
    allInvalidElms.forEach((elm) => {
      elm.addEventListener('input', function () {
        this.classList.remove('is-invalid');
      });
    });
    return;
  }
}



document.addEventListener("DOMContentLoaded", function () {
  const formVidReqElm = document.getElementById("formVideoRequest");
  const sortByElms = document.querySelectorAll("[id*=sort_by_]");
  const searchBoxElm = document.getElementById("search_box");
  loadAllVidReq();
  sortByElms.forEach((elm) => {
    elm.addEventListener("click", function (e) {
      e.preventDefault();
      sortBy = this.querySelector("input").value;
      loadAllVidReq(sortBy, searchTerm);
      this.classList.add("active");
      if (sortBy === "topVotedFirst") {
        document.getElementById("sort_by_new").classList.remove("active");
      } else {
        document.getElementById("sort_by_top").classList.remove("active");
      }
    });
  });

  searchBoxElm.addEventListener(
    "input",
    debounce((e) => {
      searchTerm = e.target.value;
      loadAllVidReq(sortBy, searchTerm);
    }, 300)
  );

  formVidReqElm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(formVidReqElm);
    isValidate(formData);
    fetch("http://localhost:7777/video-request", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        renderSingleVidReq(data, true);
      });
  });
});
