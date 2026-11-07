window.addEventListener("load", () => {
  setTimeout(() => {
    const bottom = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
    );

    window.scrollTo({
      top: bottom,
      behavior: "smooth",
    });
  }, 300);
});
function confirmDelete() {
  return confirm("Are you sure you want to delete this chat?");
}
