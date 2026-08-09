import React, { Children, isValidElement, useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export default function SolidSelect({ children, value, onChange, onOpen, className = "", disabled, name, required, "aria-label": ariaLabel, ...props }) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState("");
  const root = useRef(null);
  const options = Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];
    if (child.type === "option") return [{ value: child.props.value ?? String(child.props.children), label: child.props.children, disabled: child.props.disabled, style: child.props.style }];
    if (child.type === "optgroup") return Children.toArray(child.props.children).filter(isValidElement).map((option) => ({ value: option.props.value ?? String(option.props.children), label: option.props.children, disabled: option.props.disabled, style: option.props.style, group: child.props.label }));
    return [];
  });
  const currentValue = value ?? internalValue ?? options[0]?.value;
  const selected = options.find((item) => String(item.value) === String(currentValue)) || options[0];

  useEffect(() => {
    const close = (event) => { if (!root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  function choose(item) {
    if (item.disabled) return;
    setInternalValue(item.value);
    onChange?.({ target: { value: item.value } });
    setOpen(false);
  }

  function keyDown(event) {
    if (["Enter", " ", "ArrowDown"].includes(event.key)) { event.preventDefault(); onOpen?.(); setOpen(true); }
    if (event.key === "Escape") setOpen(false);
  }

  return (
    <div ref={root} className={`solid-select ${open ? "open" : ""} ${className}`} {...props}>
      {name && <input type="hidden" name={name} value={currentValue || selected?.value || ""} required={required} />}
      <button type="button" className="solid-select-trigger" disabled={disabled} aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} onClick={() => { if (!open) onOpen?.(); setOpen((old) => !old); }} onKeyDown={keyDown}>
        <span style={selected?.style}>{selected?.label ?? "Pilih"}</span><ChevronDown size={17} />
      </button>
      {open && (
        <div className="solid-select-menu" role="listbox" tabIndex={-1}>
          {options.map((item, index) => (
            <React.Fragment key={`${item.value}-${index}`}>
              {item.group && options[index - 1]?.group !== item.group && <small>{item.group}</small>}
              <button type="button" role="option" aria-selected={String(item.value) === String(currentValue)} disabled={item.disabled} onClick={() => choose(item)}>
                <span style={item.style}>{item.label}</span>{String(item.value) === String(currentValue) && <Check size={16} />}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
