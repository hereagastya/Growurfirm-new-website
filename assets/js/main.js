/* GrowUrFirm — site behaviour */
(function () {
  "use strict";

  var WA_NUMBER = "918591879668";
  var EMAIL = "mailgrowurfirm@gmail.com";
  // Set this to a form backend URL (Web3Forms, Formspree, your own API) to receive enquiries by email.
  // While empty, the form hands the enquiry over to WhatsApp, with email as a fallback.
  var FORM_ENDPOINT = "";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header ---------- */
  var head = document.querySelector(".site-head");
  if (head) {
    var onScroll = function () { head.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var menuBtn = document.querySelector(".menu-btn");
  if (menuBtn) {
    var setMenu = function (open) {
      document.body.classList.toggle("menu-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    menuBtn.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("menu-open"));
    });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- The desk: mess to system ---------- */
  var desk = document.querySelector(".desk");
  if (desk) {
    var toggle = desk.querySelector(".desk-toggle");
    var title = desk.querySelector(".desk-title-text");
    var foot = desk.querySelector(".desk-foot-text");
    var touched = false;

    var setSorted = function (sorted) {
      desk.classList.toggle("is-sorted", sorted);
      toggle.textContent = sorted ? "Show the old way" : "Sort this out";
      toggle.setAttribute("aria-pressed", String(sorted));
      title.textContent = sorted ? "Today in your CRM" : "Monday, 9:40 am";
      foot.textContent = sorted
        ? "Every lead, payment and follow-up in one place, with reminders on time."
        : "7 things to remember. 3 apps. 1 notebook.";
    };

    toggle.addEventListener("click", function () {
      touched = true;
      setSorted(!desk.classList.contains("is-sorted"));
    });

    if ("IntersectionObserver" in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            io.disconnect();
            setTimeout(function () { if (!touched) setSorted(true); }, 2200);
          }
        });
      }, { threshold: 0.55 });
      io.observe(desk);
    }
  }

  /* ---------- Journey route map ---------- */
  var JOURNEYS = {
    education: {
      label: "Education",
      unit: "students",
      total: 318,
      cur: 13,
      stages: [
        "Enquiry received", "First call", "Counselling session", "Course shortlisted", "Documents collected",
        "Application submitted", "Application fee paid", "Entrance test booked", "Test result", "Interview",
        "Offer letter", "Offer accepted", "Registration fee", "Installment 1", "Loan or scholarship",
        "Installment 2", "Admission confirmed", "Orientation", "Classes started", "Mid-term review",
        "Final installment", "Alumni referral"
      ]
    },
    realestate: {
      label: "Real estate",
      unit: "buyers",
      total: 146,
      cur: 5,
      stages: [
        "Enquiry", "Site visit booked", "Site visit done", "Unit shortlisted", "Negotiation", "Token paid",
        "Agreement drafted", "Agreement signed", "Loan sanctioned", "Payment milestone 1", "Payment milestone 2",
        "Registry", "Possession", "Handover"
      ]
    },
    clinic: {
      label: "Clinic",
      unit: "patients",
      total: 1204,
      cur: 4,
      stages: [
        "Appointment request", "Confirmed", "Checked in", "Consultation", "Tests ordered",
        "Reports ready", "Follow-up visit", "Treatment plan", "Payment", "Recall reminder"
      ]
    },
    distribution: {
      label: "Distributor / D2C",
      unit: "orders",
      total: 572,
      cur: 5,
      stages: [
        "Order enquiry", "Quote sent", "PO received", "Advance paid", "In production",
        "Dispatched", "Delivered", "Invoice raised", "Payment received", "Reorder due"
      ]
    }
  };

  var routeRoot = document.querySelector("[data-route]");
  if (routeRoot) {
    var tabs = routeRoot.querySelectorAll(".route-tabs button");
    var route = routeRoot.querySelector(".route");
    var meta = routeRoot.querySelector(".route-meta");
    var state = { key: "education", cur: JOURNEYS.education.cur };

    var countAt = function (j, i) {
      // Deterministic, plausible spread: more people early in the journey.
      var n = j.stages.length;
      var base = j.total / n;
      return Math.max(2, Math.round(base * (1.7 - (i / n) * 1.3) + ((i * 7) % 5)));
    };

    var columns = function () {
      var w = route.clientWidth;
      if (window.innerWidth <= 700) return 1;
      if (w < 820) return 4;
      if (w < 1000) return 5;
      return 6;
    };

    var draw = function () {
      var j = JOURNEYS[state.key];
      var cols = columns();
      route.style.setProperty("--rc", cols);
      route.innerHTML = "";

      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "line");
      svg.setAttribute("aria-hidden", "true");
      route.appendChild(svg);

      var stops = j.stages.map(function (name, i) {
        var row = Math.floor(i / cols);
        var colInRow = i % cols;
        var col = row % 2 === 0 ? colInRow : cols - 1 - colInRow;
        var el = document.createElement("button");
        el.type = "button";
        el.className = "stop " + (i < state.cur ? "done" : i === state.cur ? "cur" : "todo");
        el.style.gridRow = String(row + 1);
        el.style.gridColumn = String(col + 1);
        el.style.background = "none";
        el.style.border = "0";
        el.style.cursor = "pointer";
        el.style.font = "inherit";
        el.setAttribute("aria-pressed", String(i === state.cur));
        el.setAttribute("aria-label", "Stage " + (i + 1) + ": " + name);
        el.innerHTML =
          (i === state.cur ? '<span class="cnt">' + countAt(j, i) + " here</span>" : "") +
          '<span class="pin"></span><span class="lbl">' + name + '</span><span class="n">' + (i + 1) + "</span>";
        el.addEventListener("click", function () { state.cur = i; draw(); });
        route.appendChild(el);
        return el;
      });

      // Path through the pins, with round U-turns at row ends.
      var box = route.getBoundingClientRect();
      var pts = stops.map(function (el) {
        var p = el.querySelector(".pin").getBoundingClientRect();
        return { x: p.left + p.width / 2 - box.left, y: p.top + p.height / 2 - box.top };
      });
      var seg = function (from, to) {
        var d = "M" + pts[from].x + " " + pts[from].y;
        for (var k = from + 1; k <= to; k++) {
          var a = pts[k - 1], b = pts[k];
          if (cols > 1 && Math.abs(a.y - b.y) > 4) {
            var r = Math.abs(b.y - a.y) / 2;
            var rightSide = Math.floor((k - 1) / cols) % 2 === 0;
            d += " A" + r + " " + r + " 0 0 " + (rightSide ? 1 : 0) + " " + b.x + " " + b.y;
          } else {
            d += " L" + b.x + " " + b.y;
          }
        }
        return d;
      };
      var last = pts.length - 1;
      var rest = document.createElementNS("http://www.w3.org/2000/svg", "path");
      rest.setAttribute("class", "rest");
      rest.setAttribute("d", seg(state.cur, last));
      svg.appendChild(rest);
      if (state.cur > 0) {
        var done = document.createElementNS("http://www.w3.org/2000/svg", "path");
        done.setAttribute("class", "done");
        done.setAttribute("d", seg(0, state.cur));
        svg.appendChild(done);
      }

      var inJourney = j.total;
      meta.innerHTML =
        "<span><b>" + j.stages.length + " stages</b> set up for " + j.label.toLowerCase() + "</span>" +
        "<span><b>" + inJourney.toLocaleString("en-IN") + " " + j.unit + "</b> moving through them. Click any stage to follow one.</span>";
    };

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.setAttribute("aria-selected", "false"); });
        tab.setAttribute("aria-selected", "true");
        state.key = tab.dataset.journey;
        state.cur = JOURNEYS[state.key].cur;
        draw();
      });
    });

    draw();
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(draw, 120);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  }

  /* ---------- Enquiry form ---------- */
  document.querySelectorAll("form[data-enquiry]").forEach(function (form) {
    var shell = form.closest(".form");
    var fields = {
      name: form.elements.name,
      email: form.elements.email,
      phone: form.elements.phone
    };

    var setError = function (input, msg) {
      var field = input.closest(".field");
      if (!field) return;
      field.classList.toggle("invalid", !!msg);
      var err = field.querySelector(".err");
      if (err) err.textContent = msg || "";
      input.setAttribute("aria-invalid", msg ? "true" : "false");
    };

    var validate = function () {
      var ok = true;
      var first = null;
      var fail = function (input, msg) {
        setError(input, msg);
        ok = false;
        if (!first) first = input;
      };

      if (fields.name.value.trim().length < 2) fail(fields.name, "Enter your name so we know who to ask for.");
      else setError(fields.name);

      var email = fields.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fail(fields.email, "Enter an email like name@company.com.");
      else setError(fields.email);

      var digits = fields.phone.value.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15) fail(fields.phone, "Enter a phone number with at least 10 digits.");
      else setError(fields.phone);

      var type = form.querySelector('input[name="type"]:checked');
      var typeField = form.querySelector("[data-type-field]");
      if (typeField) {
        typeField.classList.toggle("invalid", !type);
        if (!type) { ok = false; if (!first) first = form.querySelector('input[name="type"]'); }
      }
      if (first) first.focus();
      return ok;
    };

    ["input", "change"].forEach(function (ev) {
      form.addEventListener(ev, function (e) {
        var f = e.target.closest(".field");
        if (f && f.classList.contains("invalid")) {
          f.classList.remove("invalid");
          e.target.setAttribute("aria-invalid", "false");
        }
      });
    });

    var summary = function () {
      var d = new FormData(form);
      var lines = [
        "Hi GrowUrFirm, I'd like to discuss a project.",
        "",
        "Name: " + d.get("name"),
        d.get("company") ? "Company: " + d.get("company") : null,
        "Email: " + d.get("email"),
        "Phone: " + d.get("phone"),
        "Project: " + d.get("type"),
        d.get("budget") ? "Budget: " + d.get("budget") : null,
        d.get("timeline") ? "Timeline: " + d.get("timeline") : null,
        d.get("message") ? "" : null,
        d.get("message") ? "About the project: " + d.get("message") : null
      ];
      return lines.filter(function (l) { return l !== null; }).join("\n");
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;

      var text = summary();
      var waLink = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
      var mailLink = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Project enquiry from " + form.elements.name.value.trim()) + "&body=" + encodeURIComponent(text);
      var done = shell.querySelector(".form-done");
      done.querySelector("[data-wa]").href = waLink;
      done.querySelector("[data-mail]").href = mailLink;
      var btn = form.querySelector('button[type="submit"]');

      var finish = function (sent) {
        done.querySelector("[data-done-title]").textContent = sent ? "Thanks, we've got it." : "Almost there.";
        done.querySelector("[data-done-text]").textContent = sent
          ? "We'll call or WhatsApp you within one working day, between 9 am and 9 pm IST. If it's urgent, message us now."
          : "We opened WhatsApp with your details filled in. Press send there and we'll reply within one working day. No WhatsApp? Send the same details by email.";
        shell.classList.add("is-done");
        done.setAttribute("tabindex", "-1");
        done.focus();
      };

      if (FORM_ENDPOINT) {
        btn.disabled = true;
        btn.textContent = "Sending…";
        var payload = Object.fromEntries(new FormData(form).entries());
        fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload)
        })
          .then(function (r) { if (!r.ok) throw new Error(r.status); finish(true); })
          .catch(function () {
            window.open(waLink, "_blank", "noopener");
            finish(false);
          })
          .finally(function () { btn.disabled = false; btn.textContent = "Send enquiry"; });
      } else {
        window.open(waLink, "_blank", "noopener");
        finish(false);
      }
    });

    var again = shell.querySelector("[data-again]");
    if (again) {
      again.addEventListener("click", function () {
        form.reset();
        shell.classList.remove("is-done");
        fields.name.focus();
      });
    }

    // Preselect project type from ?type= in the URL (links from service pages).
    var params = new URLSearchParams(window.location.search);
    var pre = params.get("type");
    if (pre) {
      var match = form.querySelector('input[name="type"][value="' + pre.replace(/"/g, "") + '"]');
      if (match) match.checked = true;
    }
  });
})();
