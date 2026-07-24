// Glifos de interfaz dibujados a mano (trazo currentColor, 24×24) para no
// cargar el paquete completo de Phosphor en el chunk de Nido: el presupuesto
// de peso solo permite reutilizar los iconos que la página principal ya trae.

function Glyph({ size = 24, weight, tint, children, filled = false, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

const make = (children, filled = false) => {
  function UiGlyph(props) {
    return (
      <Glyph filled={filled} {...props}>
        {children}
      </Glyph>
    );
  }
  return UiGlyph;
};

const arrow = (rotation) =>
  make(
    <g transform={rotation ? `rotate(${rotation} 12 12)` : undefined}>
      <path d="M4 12 L20 12 M13.5 5.5 L20 12 L13.5 18.5" />
    </g>,
  );

export const UI_GLYPHS = Object.freeze({
  ArrowDown: arrow(90),
  ArrowLeftGlyph: arrow(180),
  ArrowBendRightUp: make(<path d="M5 20 Q5 8 17 8 M12.5 12.5 L17 8 L12.5 3.5" />),
  ArrowBendLeftDown: make(<path d="M19 4 Q19 16 7 16 M11.5 11.5 L7 16 L11.5 20.5" />),
  ArrowSquareIn: make(
    <g>
      <path d="M9 4 L20 4 L20 15" />
      <path d="M4 20 L13 11 M13 17 L13 11 L7 11" />
    </g>,
  ),
  ArrowSquareOut: make(
    <g>
      <path d="M10 5 L4 5 L4 20 L19 20 L19 14" />
      <path d="M13 4 L20 4 L20 11 M20 4 L11 13" />
    </g>,
  ),
  ArrowsDownUp: make(
    <g>
      <path d="M7 4 L7 20 M3.5 16.5 L7 20 L10.5 16.5" />
      <path d="M17 20 L17 4 M13.5 7.5 L17 4 L20.5 7.5" />
    </g>,
  ),
  ArrowsHorizontal: make(
    <path d="M3 12 L21 12 M6.5 8.5 L3 12 L6.5 15.5 M17.5 8.5 L21 12 L17.5 15.5" />,
  ),
  ArrowsLeftRight: make(
    <g>
      <path d="M8 7 L3 7 M3 7 L6 4 M3 7 L6 10" transform="translate(1 0)" />
      <path d="M15 17 L21 17 M21 17 L18 14 M21 17 L18 20" transform="translate(-1 0)" />
    </g>,
  ),
  ArrowsOut: make(
    <g>
      <path d="M14 4 L20 4 L20 10 M20 4 L14.5 9.5" />
      <path d="M10 20 L4 20 L4 14 M4 20 L9.5 14.5" />
    </g>,
  ),
  SortAscending: make(
    <g>
      <path d="M4 6 L11 6 M4 12 L9 12 M4 18 L7 18" />
      <path d="M17 6 L17 18 M13.5 14.5 L17 18 L20.5 14.5" />
    </g>,
  ),
  SortDescending: make(
    <g>
      <path d="M4 6 L7 6 M4 12 L9 12 M4 18 L11 18" />
      <path d="M17 18 L17 6 M13.5 9.5 L17 6 L20.5 9.5" />
    </g>,
  ),
  ChartLineUp: make(
    <g>
      <path d="M4 4 L4 20 L20 20" />
      <path d="M7 15 L11 11 L14 13 L19 7 M19 11 L19 7 L15 7" />
    </g>,
  ),
  Browsers: make(
    <g>
      <rect x="6" y="3.5" width="14.5" height="12" rx="1.5" />
      <path d="M3.5 8 L3.5 19 Q3.5 20 4.5 20 L17 20 M6 6.8 L20.5 6.8" />
    </g>,
  ),
  Brain: make(
    <g>
      <path d="M12 4.5 Q9 3 7 5 Q4 5.5 4.5 8.5 Q3 10.5 4.5 12.5 Q4 15.5 7 16.5 Q8 19.5 11 18.5 L12 18.5 Q12 4.5 12 4.5 Z" />
      <path d="M12 4.5 Q15 3 17 5 Q20 5.5 19.5 8.5 Q21 10.5 19.5 12.5 Q20 15.5 17 16.5 Q16 19.5 13 18.5 L12 18.5" />
      <path d="M12 5 L12 18.5 M12 21 L12 18.5" />
    </g>,
  ),
  CalendarBlank: make(
    <g>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5 L20 9.5 M8 3 L8 6.5 M16 3 L16 6.5" />
    </g>,
  ),
  ChalkboardTeacher: make(
    <g>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <circle cx="9" cy="10" r="2" />
      <path d="M5.5 16 Q5.5 13.5 9 13.5 Q12.5 13.5 12.5 16" />
      <path d="M16 20 L21 20 M17 8 L18 8" />
    </g>,
  ),
  ChatCircleDots: make(
    <g>
      <path d="M12 4 Q20 4 20 11 Q20 18 12 18 L6 20 L7 16.5 Q4 15 4 11 Q4 4 12 4 Z" />
      <circle cx="8.5" cy="11" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="11" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="11" r="0.9" fill="currentColor" stroke="none" />
    </g>,
  ),
  CirclesThreePlus: make(
    <g>
      <circle cx="7" cy="7" r="3.2" />
      <circle cx="17" cy="7" r="3.2" />
      <circle cx="7" cy="17" r="3.2" />
      <path d="M17 14 L17 20 M14 17 L20 17" />
    </g>,
  ),
  Copy: make(
    <g>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M5 15 Q4 15 4 14 L4 5 Q4 4 5 4 L14 4 Q15 4 15 5" />
    </g>,
  ),
  Detective: make(
    <g>
      <circle cx="12" cy="13" r="6.5" />
      <path d="M4 9.5 L20 9.5 M8 9.5 Q8 5 12 5 Q16 5 16 9.5" />
      <circle cx="9.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
    </g>,
  ),
  Eye: make(
    <g>
      <path d="M2.5 12 Q7 5.5 12 5.5 Q17 5.5 21.5 12 Q17 18.5 12 18.5 Q7 18.5 2.5 12 Z" />
      <circle cx="12" cy="12" r="3" />
    </g>,
  ),
  EyeClosed: make(
    <g>
      <path d="M3 10 Q7 15 12 15 Q17 15 21 10" />
      <path d="M5.5 13.6 L4 16 M12 15 L12 18 M18.5 13.6 L20 16" />
    </g>,
  ),
  Fire: make(
    <g>
      <path d="M12 3 Q12.5 6.5 15.5 9 Q19 12 18 15.5 Q17 20 12 20.5 Q7 20 6 15.5 Q5 12 8 8.5 Q10.5 6 11 3 Q11.5 4 12 3 Z" />
      <path d="M12 12 Q14.5 14 14 16.5 Q13.5 18.5 12 18.5 Q10.5 18.5 10 16.5 Q9.5 14 12 12 Z" />
    </g>,
  ),
  Flask: make(
    <g>
      <path d="M10 3.5 L10 9 L5 18 Q4 20.5 6.5 20.5 L17.5 20.5 Q20 20.5 19 18 L14 9 L14 3.5" />
      <path d="M8.5 3.5 L15.5 3.5 M7.5 14.5 L16.5 14.5" />
    </g>,
  ),
  Heart: make(
    <path d="M12 20 Q4 14.5 4 9.5 Q4 5.5 7.5 5.5 Q10.5 5.5 12 8.5 Q13.5 5.5 16.5 5.5 Q20 5.5 20 9.5 Q20 14.5 12 20 Z" />,
  ),
  IdentificationCard: make(
    <g>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="11" r="2" />
      <path d="M5.5 16 Q5.5 14 8.5 14 Q11.5 14 11.5 16 M14.5 9.5 L18.5 9.5 M14.5 13 L18.5 13" />
    </g>,
  ),
  MaskHappyGlyph: make(
    <g>
      <path d="M4 4.5 Q12 7 20 4.5 Q21 12 17.5 16.5 Q15 19.8 12 19.8 Q9 19.8 6.5 16.5 Q3 12 4 4.5 Z" />
      <path d="M7.5 10 Q9 8.8 10.5 10 M13.5 10 Q15 8.8 16.5 10 M8 13.5 Q12 17 16 13.5" />
    </g>,
  ),
  MathOperations: make(
    <g>
      <path d="M4.5 7 L10 7 M7.25 4.25 L7.25 9.75" />
      <path d="M14.5 6 L20 6 M14.5 8.5 L20 8.5" />
      <path d="M5 15.5 L9.5 20 M9.5 15.5 L5 20" />
      <path d="M14.5 17.75 L20 17.75" />
      <circle cx="17.25" cy="15" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="17.25" cy="20.5" r="0.9" fill="currentColor" stroke="none" />
    </g>,
  ),
  MusicNotes: make(
    <g>
      <path d="M9 17.5 L9 6.5 L19 4 L19 15" />
      <ellipse cx="6.8" cy="17.5" rx="2.3" ry="1.9" />
      <ellipse cx="16.8" cy="15" rx="2.3" ry="1.9" />
    </g>,
  ),
  NumberCircleOne: make(
    <g>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10 9.5 L12.5 7.5 L12.5 16.5" />
    </g>,
  ),
  PaintBrush: make(
    <g>
      <path d="M20 4 Q14 6 10.5 11.5 L13 14 Q18 10.5 20 4 Z" />
      <path d="M10 12.5 Q7 12.5 6 15 Q5.5 17.5 3.5 18.5 Q6 20.5 9 19.5 Q11.5 18.5 11.5 15.5 Z" />
    </g>,
  ),
  Person: make(
    <g>
      <circle cx="12" cy="7" r="3.5" />
      <path d="M5.5 20 Q5.5 13.5 12 13.5 Q18.5 20 18.5 20 Q18.5 13.5 12 13.5" />
      <path d="M5.5 20 Q5.5 13.5 12 13.5 Q18.5 13.5 18.5 20" />
    </g>,
  ),
  PersonSimple: make(
    <g>
      <circle cx="12" cy="5" r="2.5" />
      <path d="M4 10.5 Q12 13 20 10.5 M12 12 L12 16 M12 16 L8 21 M12 16 L16 21" />
    </g>,
  ),
  PersonSimpleRun: make(
    <g>
      <circle cx="15" cy="4.5" r="2.3" />
      <path d="M4.5 11.5 Q9 8.5 13 10.5 L10 15 L13.5 18.5 L12 21.5 M13 10.5 L17 13 L20.5 12 M10 15 L6.5 16 L4 19.5" />
    </g>,
  ),
  PersonSimpleTaiChi: make(
    <g>
      <circle cx="12" cy="4.5" r="2.3" />
      <path d="M3.5 8.5 L12 10 L20.5 8.5 M12 10 L12 15 M12 15 L7.5 18 L7.5 21.5 M12 15 L16.5 18 L16.5 21.5" />
    </g>,
  ),
  PlusCircle: make(
    <g>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8 L12 16 M8 12 L16 12" />
    </g>,
  ),
  PuzzlePiece: make(
    <path d="M9 4.5 Q9 2.5 11 2.5 Q13 2.5 13 4.5 L13 5.5 L17.5 5.5 Q18.5 5.5 18.5 6.5 L18.5 10 Q20.5 10 20.5 12 Q20.5 14 18.5 14 L18.5 17.5 Q18.5 18.5 17.5 18.5 L14 18.5 Q14 20.5 12 20.5 Q10 20.5 10 18.5 L6.5 18.5 Q5.5 18.5 5.5 17.5 L5.5 14 Q3.5 14 3.5 12 Q3.5 10 5.5 10 L5.5 6.5 Q5.5 5.5 6.5 5.5 L9 5.5 Z" />,
  ),
  Question: make(
    <g>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 9.5 Q9.5 7 12 7 Q14.5 7 14.5 9.2 Q14.5 11 12 11.8 L12 13.5" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
    </g>,
  ),
  SelectionSlash: make(
    <g>
      <path d="M5 8 L5 6 Q5 5 6 5 L8 5 M12 5 L14 5 M18 5 Q19 5 19 6 L19 8 M19 12 L19 14 M19 18 Q19 19 18 19 L16 19 M12 19 L10 19 M5 16 L5 18 Q5 19 6 19" strokeDasharray="0" />
      <path d="M4 4 L20 20" />
    </g>,
  ),
  Shapes: make(
    <g>
      <path d="M8.5 3.5 L13 10.5 L4 10.5 Z" />
      <circle cx="17" cy="8" r="3.6" />
      <rect x="6" y="13.5" width="7" height="7" rx="1" />
      <path d="M15.5 14.5 L21 14.5 L21 20 L15.5 20 Z" transform="rotate(10 18.2 17.2)" />
    </g>,
  ),
  SignOut: make(
    <g>
      <path d="M10 4 L5 4 Q4 4 4 5 L4 19 Q4 20 5 20 L10 20" />
      <path d="M9 12 L20 12 M16 8 L20 12 L16 16" />
    </g>,
  ),
  StopCircle: make(
    <g>
      <circle cx="12" cy="12" r="8.5" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" stroke="none" />
    </g>,
  ),
  Subtract: make(
    <g>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8 12 L16 12" />
    </g>,
  ),
  Table: make(
    <g>
      <path d="M3 8 L21 8 L21 10.5 L3 10.5 Z" />
      <path d="M5 10.5 L5 19 M19 10.5 L19 19 M8.5 10.5 L8.5 14 L15.5 14 L15.5 10.5" />
    </g>,
  ),
  Translate: make(
    <g>
      <path d="M4 5 L14 5 M9 3 L9 5 M12.5 5 Q11.5 11 5.5 14 M6 8 Q8.5 12.5 12.5 14" />
      <path d="M12 20.5 L16.5 10.5 L21 20.5 M13.6 17 L19.4 17" />
    </g>,
  ),
  Trash: make(
    <g>
      <path d="M4.5 6.5 L19.5 6.5 M9.5 4 L14.5 4 M6.5 6.5 L7.5 20 Q7.6 21 8.6 21 L15.4 21 Q16.4 21 16.5 20 L17.5 6.5" />
      <path d="M10 10 L10 17.5 M14 10 L14 17.5" />
    </g>,
  ),
  Trophy: make(
    <g>
      <path d="M8 4 L16 4 L16 10 Q16 14 12 14 Q8 14 8 10 Z" />
      <path d="M8 5.5 Q4.5 5.5 4.5 8.5 Q4.5 11 8 11.3 M16 5.5 Q19.5 5.5 19.5 8.5 Q19.5 11 16 11.3" />
      <path d="M12 14 L12 17 M9 19.5 Q12 18 15 19.5 M8 20.5 L16 20.5" />
    </g>,
  ),
  UsersThree: make(
    <g>
      <circle cx="12" cy="8" r="3" />
      <path d="M6.5 19 Q6.5 13.5 12 13.5 Q17.5 13.5 17.5 19" />
      <circle cx="4.8" cy="9.5" r="2.2" />
      <path d="M1.5 16.5 Q1.8 12.8 5.5 13" />
      <circle cx="19.2" cy="9.5" r="2.2" />
      <path d="M22.5 16.5 Q22.2 12.8 18.5 13" />
    </g>,
  ),
  XCircle: make(
    <g>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 9 L15 15 M15 9 L9 15" />
    </g>,
  ),
});
