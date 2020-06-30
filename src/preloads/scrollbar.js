window.addEventListener('load', updateScrollbar)

function updateScrollbar() {
  console.log("scrollbar started...")
  const style = document.createElement('style');
  style.innerHTML = `::-webkit-scrollbar-track {
  border-radius: 3px;
}

::-webkit-scrollbar {
  width: 12px;
  background-color: #4c4c4c;
  border-radius: 0px;
}

::-webkit-scrollbar-thumb {
  cursor: pointer;
  border-radius: inherit;
  background-color: rgba(0, 0, 0, 0.4);
}
`;
  document.head.appendChild(style);
}