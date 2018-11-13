/**
 * Setup the code interface for the sidebar.
 *
 * @author Llyme
**/
const mod_code = {};

spook.waitForChildren(_ => mod_relay.waitForDatabase(_ =>
	mod_sidebar.init(
		code_space,
		128,
		64,
		mod_relay.Code.get,
		doc => doc.code,
		(doc, index) => {
			// Empty string. Description can be empty.
			if (doc.code.search(/\S/) == -1)
				return;

			// Already created.
			if (mod_code.has(doc.code))
				return;


			/* Draw the client button element. Automatically select it
			   if it was still selected after being removed when
			   scrolling too far.
			*/
			let btn = q("#code_space !label");
			btn.innerHTML =
				"<label>" + doc.code + "</label>" +
				(doc.description || "");

			if (index != null)
				code_space.insertBefore(
					btn,
					code_space.childNodes[index]
				);


			// Add client's data to list.
			let data = mod_code.get(doc.code) || doc;
			data.btn = btn;


			// Setup button.
			btn.addEventListener("click", event => {
			});

			return data;
		},
		data => {
			data.btn.remove();

			return true;
		}
	)(mod_code)
));

code_new.addEventListener("click", _ => {
	code_popup_code.value = code_popup_desc.value = "";

	code_popup.removeAttribute("invisible");
	code_popup_code.focus();
});

spook.return();
