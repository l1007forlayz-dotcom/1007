(() => {
    "use strict";

    const header = document.querySelector(".site-header");
    const nav = document.querySelector(".primary-nav");
    const navToggle = document.querySelector(".nav-toggle");
    const navToggleLabel = navToggle?.querySelector(".sr-only");
    const navLinks = [...document.querySelectorAll("[data-nav-link]")];
    const mobileBreakpoint = window.matchMedia("(max-width: 900px)");

    const closeMenu = (returnFocus = false) => {
        if (!nav || !navToggle) return;

        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");

        if (navToggleLabel) {
            navToggleLabel.textContent = "打开导航菜单";
        }

        if (returnFocus) {
            navToggle.focus();
        }
    };

    const openMenu = () => {
        if (!nav || !navToggle) return;

        nav.classList.add("is-open");
        navToggle.setAttribute("aria-expanded", "true");
        document.body.classList.add("nav-open");

        if (navToggleLabel) {
            navToggleLabel.textContent = "关闭导航菜单";
        }
    };

    navToggle?.addEventListener("click", () => {
        const isOpen = navToggle.getAttribute("aria-expanded") === "true";
        isOpen ? closeMenu() : openMenu();
    });

    nav?.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            closeMenu();
        }
    });

    document.addEventListener("click", (event) => {
        if (
            mobileBreakpoint.matches &&
            nav?.classList.contains("is-open") &&
            !event.target.closest(".site-header")
        ) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && nav?.classList.contains("is-open")) {
            closeMenu(true);
        }
    });

    mobileBreakpoint.addEventListener?.("change", (event) => {
        if (!event.matches) {
            closeMenu();
        }
    });

    let scrollTicking = false;
    const updateHeader = () => {
        header?.classList.toggle("is-scrolled", window.scrollY > 12);
        scrollTicking = false;
    };

    window.addEventListener(
        "scroll",
        () => {
            if (!scrollTicking) {
                window.requestAnimationFrame(updateHeader);
                scrollTicking = true;
            }
        },
        { passive: true }
    );
    updateHeader();

    const observedSections = navLinks
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    if ("IntersectionObserver" in window && observedSections.length) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (!visible) return;

                navLinks.forEach((link) => {
                    const isCurrent = link.getAttribute("href") === `#${visible.target.id}`;
                    link.classList.toggle("is-active", isCurrent);

                    if (isCurrent) {
                        link.setAttribute("aria-current", "page");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            },
            {
                rootMargin: "-34% 0px -54% 0px",
                threshold: [0, 0.15, 0.35],
            }
        );

        observedSections.forEach((section) => sectionObserver.observe(section));
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = [...document.querySelectorAll("[data-reveal]")];

    revealItems.forEach((item) => item.classList.add("reveal"));

    if (!reduceMotion && "IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
        );

        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    }

    const bookingForm = document.querySelector("#booking-form");
    const serviceSelect = document.querySelector("#service");
    const nameInput = document.querySelector("#name");
    const dateInput = document.querySelector("#date");
    const detailsInput = document.querySelector("#details");
    const detailsCount = document.querySelector("#details-count");
    const formStatus = document.querySelector("#form-status");
    const submitButton = bookingForm?.querySelector('button[type="submit"]');
    const submitButtonText = submitButton?.querySelector("span");

    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() * 60 * 1000;
    const localToday = new Date(today.getTime() - timezoneOffset).toISOString().split("T")[0];

    if (dateInput) {
        dateInput.min = localToday;
    }

    document.querySelectorAll(".service-choice").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            if (serviceSelect) {
                serviceSelect.value = link.dataset.service || "";
                clearFieldError(serviceSelect);
            }

            document.querySelector("#booking")?.scrollIntoView({
                behavior: reduceMotion ? "auto" : "smooth",
                block: "start",
            });

            window.setTimeout(() => {
                nameInput?.focus({ preventScroll: true });
            }, reduceMotion ? 0 : 550);
        });
    });

    detailsInput?.addEventListener("input", () => {
        if (detailsCount) {
            detailsCount.textContent = `${detailsInput.value.length}/300`;
        }
    });

    const getErrorElement = (field) => document.querySelector(`#${field.id}-error`);

    function setFieldError(field, message) {
        field.setAttribute("aria-invalid", "true");
        const errorElement = getErrorElement(field);

        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    function clearFieldError(field) {
        field.removeAttribute("aria-invalid");
        const errorElement = getErrorElement(field);

        if (errorElement) {
            errorElement.textContent = "";
        }
    }

    const validateField = (field) => {
        const value = field.type === "checkbox" ? field.checked : field.value.trim();
        let message = "";

        if (field.required && !value) {
            const labels = {
                name: "请填写您的称呼",
                phone: "请填写联系电话",
                service: "请选择服务项目",
                date: "请选择预计日期",
                hospital: "请填写所在城市和就诊医院",
                consent: "请阅读并同意隐私说明",
            };
            message = labels[field.id] || "请填写此项";
        } else if (field.id === "name" && field.value.trim().length < 2) {
            message = "称呼至少需要 2 个字符";
        } else if (field.id === "phone") {
            const normalizedPhone = field.value.replace(/[\s-]/g, "");
            if (!/^1[3-9]\d{9}$/.test(normalizedPhone)) {
                message = "请输入 11 位中国大陆手机号码";
            }
        } else if (field.id === "date" && field.value < localToday) {
            message = "预计日期不能早于今天";
        }

        if (message) {
            setFieldError(field, message);
            return false;
        }

        clearFieldError(field);
        return true;
    };

    const fieldsToValidate = bookingForm
        ? [...bookingForm.querySelectorAll("input[required], select[required]")]
        : [];

    fieldsToValidate.forEach((field) => {
        const eventName = field.type === "checkbox" || field.tagName === "SELECT" || field.type === "date"
            ? "change"
            : "input";
        field.addEventListener(eventName, () => validateField(field));
        field.addEventListener("blur", () => validateField(field));
    });

    bookingForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        formStatus?.classList.remove("is-visible", "is-success", "is-error");
        const validationResults = fieldsToValidate.map(validateField);
        const isValid = validationResults.every(Boolean);

        if (!isValid) {
            const firstInvalidField = bookingForm.querySelector('[aria-invalid="true"]');
            firstInvalidField?.focus();

            if (formStatus) {
                formStatus.textContent = "请检查标红的必填信息后再提交。";
                formStatus.classList.add("is-visible", "is-error");
            }
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
        }
        if (submitButtonText) {
            submitButtonText.textContent = "正在检查信息…";
        }

        window.setTimeout(() => {
            bookingForm.reset();
            fieldsToValidate.forEach(clearFieldError);

            if (detailsCount) {
                detailsCount.textContent = "0/300";
            }

            if (formStatus) {
                formStatus.textContent = "演示提交成功：表单校验与反馈正常。当前版本不会上传信息，正式上线时需接入预约接收渠道。";
                formStatus.classList.add("is-visible", "is-success");
            }

            if (submitButton) {
                submitButton.disabled = false;
            }
            if (submitButtonText) {
                submitButtonText.textContent = "提交预约";
            }
        }, 650);
    });

    const yearElement = document.querySelector("#current-year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
})();
