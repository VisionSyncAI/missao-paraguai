export function initForm() {
  const form = document.getElementById("preselecao");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    window.location.href = "/interesse";
  });
}
