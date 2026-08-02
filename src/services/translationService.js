import { auth } from "../firebase/config";

export async function translateVisiblePage(target) {
  const nodes = [];
  const walker = document.createTreeWalker(
    document.querySelector(".app-shell") || document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const text = node.nodeValue?.trim();
        const tag = node.parentElement?.tagName;
        return text && !["SCRIPT", "STYLE", "TEXTAREA", "OPTION"].includes(tag)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    },
  );
  while (walker.nextNode()) {
    const node = walker.currentNode;
    node._jpOriginal ||= node.nodeValue;
    nodes.push(node);
  }
  if (target === "id") {
    nodes.forEach((n) => (n.nodeValue = n._jpOriginal));
    return;
  }
  const texts = nodes.map((n) => n._jpOriginal.trim());
  const token = await auth.currentUser?.getIdToken();
  for (let i = 0; i < texts.length; i += 80) {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`,
      },
      body: JSON.stringify({ texts: texts.slice(i, i + 80), target }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Terjemahan gagal.");
    data.translations.forEach((text, index) => {
      nodes[i + index].nodeValue = ` ${text} `;
    });
  }
}
