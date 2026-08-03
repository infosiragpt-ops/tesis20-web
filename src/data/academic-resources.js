export const ACADEMIC_RESOURCES = [
  {
    id: "isam",
    shortName: "ISAM",
    name: "Escuela ISAM",
    description:
      "Documento institucional identificado con la R. M. 405-2024-MINEDU.",
    sourceUrl: "https://escuelaisam.edu.pe/",
    documents: [
      {
        id: "isam-lineas-investigacion-ejes-tematicos",
        title: "Líneas de investigación y ejes temáticos",
        category: "Líneas de investigación",
        description:
          "Presenta líneas, temas y objetivos de investigación organizados por programa de estudio.",
        href: "/downloads/recursos/isam-lineas-investigacion-ejes-tematicos.pdf",
        fileName: "isam-lineas-investigacion-ejes-tematicos.pdf",
        format: "PDF",
        pages: 1,
        programs: [
          "Gestión de Sistemas de Información",
          "Administración y Dirección Empresarial",
          "Gestión Contable y Financiera",
          "Gestión Pública y de Proyectos",
        ],
      },
    ],
  },
];

export const ACADEMIC_RESOURCE_DOCUMENT_COUNT = ACADEMIC_RESOURCES.reduce(
  (total, institution) => total + institution.documents.length,
  0,
);
