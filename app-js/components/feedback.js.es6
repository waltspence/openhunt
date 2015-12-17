(() => {
  $(document).ready(() => {

    var openFeedback = (slug) => {
      if(!slug){ return; }

      console.log("opening feedback: "+slug);
      window.location.hash = `open=${slug}`;

      $(".project-listing").removeClass("selected");
      $(`.project-listing[data-project-slug='${slug}']`).addClass("selected");

      var feedbackPanel = $("#feedback-panel");
      feedbackPanel.fadeIn();

      // return if its already loaded
      if(feedbackPanel.data("current-project-slug") === slug) {
        return;
      }
      feedbackPanel.data("current-project-slug", slug);

      feedbackPanel.addClass("loading");
      console.log("LOADING FROM AJAX...");
      $.ajax({
        type: "GET",
        url: `/feedback/${slug}`,
        data: {partial: true},
        success: (html) => {
          feedbackPanel.find(".project-feedback").replaceWith(html);
        },
        error: (xhr) => {
          console.error("Unable to load feedback:", slug, xhr)
          closeFeedback();
        },
        complete: (json) => {
          feedbackPanel.removeClass("loading");
        }
      });
    };

    var closeFeedback = () => {
      window.location.hash = "";
      $("#feedback-panel").fadeOut();
      $(".project-listing").removeClass("selected");
    };

    // for debugging purposes
    window.openFeedback = openFeedback;
    window.closeFeedback = closeFeedback;

    var initialHash = (window.location.hash || "");
    if(initialHash.indexOf("open=") >= 0) {
      var val = _.last(initialHash.split("="));
      openFeedback(val);
    }

    $(document).on("click", ".project-listing", (e) => {
      var target = $(e.target);

      // skip links
      if(target.closest("a").length > 0) { return; }

      var projectListing = target.closest(".project-listing");

      openFeedback(projectListing.data("project-slug"));
    });

  });
})();