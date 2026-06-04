type Props = {
  variant?: "default" | "small" | "login";
  white?: boolean;
};

export default function BrandWordmark({ variant = "default", white = false }: Props) {
  const cls = [
    "brand-wordmark",
    variant === "small" ? "is-small" : "",
    variant === "login" ? "is-login" : "",
    white ? "is-white" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={cls} aria-label="Minas Tintas">
      <span className="brand-minas">Minas</span>
      <span className="brand-tintas">TINTAS</span>
    </span>
  );
}
