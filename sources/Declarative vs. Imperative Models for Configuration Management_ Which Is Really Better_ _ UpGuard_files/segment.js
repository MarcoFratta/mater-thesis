(() => {
  // CTA Clicked
  window.addEventListener("click", (e) => {
    const eventName = "CTA Clicked"
    const $trigger = e.target.closest(`[data-event="${eventName}"]`)
    if ($trigger) {
      const $location = $trigger.closest("[data-event-cta-location]")
      const $ctaContentEl = $trigger.querySelector("[data-event-cta-el]")

      analytics.track(eventName, {
        ctaContent: ($ctaContentEl || $trigger).innerText,
        ctaLinkType: $trigger.dataset.eventCtaLinkType || "", // data-event-cta-link-type
        ctaLocation: $location ? $location.dataset.eventCtaLocation : ""
      })
    }
  })

  // Experiment Viewed
  if (window.optibaseAddActiveVariantsListener) {
    optibaseAddActiveVariantsListener((variants) => {
      variants.forEach(variant => {
        const { userFriendlyTestId, userFriendlyVariantId } = variant

        analytics.track("Experiment Viewed", {
          // Alternatively use experiment_name and variant_name
          experimentId: userFriendlyTestId,
          variantId: userFriendlyVariantId
        })
      })
    })
  }

  // HubSpot
  const forms = new Map()
  const formContextSelector = '[data-event="Form Submitted"]'

  window.addEventListener("message", event => {
    // When form is ready, find the form and read event data attributes that wrap it
    if (event.data.type === "hsFormCallback" && event.data.eventName === "onFormReady") {
      const $form = document.querySelector(`[data-form-id="${event.data.id}"]`)
      if ($form) {
        const $context = $form.closest(formContextSelector)
        if ($context) {
          forms.set(event.data.id, {
            eventName: $context.dataset.eventName,
            $form,
            dataset: $context.dataset,
          })
        }
      }
    }

    if (event.data.type === "hsFormCallback" && event.data.eventName === "onFormSubmitted") {
      if (forms.has(event.data.id)) {
        try {
          const { eventName } = forms.get(event.data.id)

          // Demo Form Submitted
          if (eventName === "Demo Form Submitted") {
            const fields = snakeToCamel(event.data.data.submissionValues)
            if (fields.countryList) {
              fields.address = { country: fields.countryList }
              delete fields.countryList
            }
            delete fields.hsContext

            analytics.track(eventName, fields)
            analytics.identify({
              email: fields.email,
              userIntentResultOutcome: fields.userIntentResultOutcome,
              regulatoryComplianceRequirementsYesNo: fields.regulatoryComplianceRequirementsYesNo,
              icpVendorsVr: fields.icpVendorsVr,
              icpProcessDetailVr: fields.icpProcessDetailVr,
            })
          }

          // Resource Requested
          if (eventName === "Resource Requested") {
            const { dataset } = forms.get(event.data.id)
            const { email, jobtitle: title } = event.data.data.submissionValues
            analytics.track(eventName, {
              resourceAssetName: dataset.eventResourceAssetName,
            })
            analytics.identify({ email, title })
          }

        } catch (error) {
          console.error(error)
        }
      }
    }
  })

  function snakeToCamel(obj) {
    const newObj = {}
    Object.entries(obj)
      .forEach(([key, value]) => {
        const [first, ...rest] = key.split("_")
        key = first + rest.map(str => str.charAt(0).toUpperCase() + str.slice(1)).join("")
        newObj[key] = value
      })
    return newObj
  }
})()
