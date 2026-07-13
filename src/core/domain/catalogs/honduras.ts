export interface Municipio {
  id: number;
  nombre: string;
}

export interface Departamento {
  id: number;
  code: string;
  nombre: string;
  municipios: Municipio[];
}

export const DEPARTAMENTOS: Departamento[] = [
  {
    id: 1, code: 'ATL', nombre: 'Atlántida',
    municipios: [
      { id: 101, nombre: 'La Ceiba' }, { id: 102, nombre: 'El Porvenir' },
      { id: 103, nombre: 'Esparta' }, { id: 104, nombre: 'Jutiapa' },
      { id: 105, nombre: 'La Masica' }, { id: 106, nombre: 'San Francisco' },
      { id: 107, nombre: 'Tela' }, { id: 108, nombre: 'Arizona' },
    ],
  },
  {
    id: 2, code: 'CH', nombre: 'Choluteca',
    municipios: [
      { id: 201, nombre: 'Choluteca' }, { id: 202, nombre: 'Apacilagua' },
      { id: 203, nombre: 'Concepción de María' }, { id: 204, nombre: 'Duyure' },
      { id: 205, nombre: 'El Corpus' }, { id: 206, nombre: 'El Triunfo' },
      { id: 207, nombre: 'Marcovia' }, { id: 208, nombre: 'Morolica' },
      { id: 209, nombre: 'Namasigüe' }, { id: 210, nombre: 'Orocuina' },
      { id: 211, nombre: 'Pespire' }, { id: 212, nombre: 'San Antonio de Flores' },
      { id: 213, nombre: 'San Isidro' }, { id: 214, nombre: 'San José' },
      { id: 215, nombre: 'San Marcos de Colón' }, { id: 216, nombre: 'Santa Ana de Yusguare' },
    ],
  },
  {
    id: 3, code: 'CL', nombre: 'Colón',
    municipios: [
      { id: 301, nombre: 'Trujillo' }, { id: 302, nombre: 'Balfate' },
      { id: 303, nombre: 'Iriona' }, { id: 304, nombre: 'Limón' },
      { id: 305, nombre: 'Lucía' }, { id: 306, nombre: 'Sabá' },
      { id: 307, nombre: 'Santa Fe' }, { id: 308, nombre: 'Santa Rosa de Aguán' },
      { id: 309, nombre: 'Sonaguera' }, { id: 310, nombre: 'Tocoa' },
      { id: 311, nombre: 'Bonito Oriental' },
    ],
  },
  {
    id: 4, code: 'CM', nombre: 'Comayagua',
    municipios: [
      { id: 401, nombre: 'Comayagua' }, { id: 402, nombre: 'Ajuterique' },
      { id: 403, nombre: 'El Rosario' }, { id: 404, nombre: 'Esquías' },
      { id: 405, nombre: 'Humuya' }, { id: 406, nombre: 'La Libertad' },
      { id: 407, nombre: 'Lamaní' }, { id: 408, nombre: 'La Trinidad' },
      { id: 409, nombre: 'Lejamaní' }, { id: 410, nombre: 'Meámbar' },
      { id: 411, nombre: 'Minas de Oro' }, { id: 412, nombre: 'Ojos de Agua' },
      { id: 413, nombre: 'San Jerónimo' }, { id: 414, nombre: 'San José de Comayagua' },
      { id: 415, nombre: 'San José del Potrero' }, { id: 416, nombre: 'San Luis' },
      { id: 417, nombre: 'San Sebastián' }, { id: 418, nombre: 'Siguatepeque' },
      { id: 419, nombre: 'Villa de San Antonio' }, { id: 420, nombre: 'Las Lajas' },
      { id: 421, nombre: 'Taulabé' },
    ],
  },
  {
    id: 5, code: 'CP', nombre: 'Copán',
    municipios: [
      { id: 501, nombre: 'Santa Rosa de Copán' }, { id: 502, nombre: 'Cabañas' },
      { id: 503, nombre: 'Concepción' }, { id: 504, nombre: 'Copán Ruinas' },
      { id: 505, nombre: 'Corquín' }, { id: 506, nombre: 'Cucuyagua' },
      { id: 507, nombre: 'Dolores' }, { id: 508, nombre: 'Dulce Nombre' },
      { id: 509, nombre: 'El Paraíso' }, { id: 510, nombre: 'Florida' },
      { id: 511, nombre: 'La Jigua' }, { id: 512, nombre: 'La Unión' },
      { id: 513, nombre: 'Nueva Arcadia' }, { id: 514, nombre: 'San Agustín' },
      { id: 515, nombre: 'San Antonio' }, { id: 516, nombre: 'San Jerónimo' },
      { id: 517, nombre: 'San José' }, { id: 518, nombre: 'San Juan de Opoa' },
      { id: 519, nombre: 'San Nicolás' }, { id: 520, nombre: 'San Pedro' },
      { id: 521, nombre: 'Santa Rita' }, { id: 522, nombre: 'Trinidad de Copán' },
      { id: 523, nombre: 'Veracruz' },
    ],
  },
  {
    id: 6, code: 'CO', nombre: 'Cortés',
    municipios: [
      { id: 601, nombre: 'San Pedro Sula' }, { id: 602, nombre: 'Choloma' },
      { id: 603, nombre: 'La Lima' }, { id: 604, nombre: 'Omoa' },
      { id: 605, nombre: 'Pimienta' }, { id: 606, nombre: 'Potrerillos' },
      { id: 607, nombre: 'Puerto Cortés' }, { id: 608, nombre: 'San Antonio de Cortés' },
      { id: 609, nombre: 'San Francisco de Yojoa' }, { id: 610, nombre: 'San Manuel' },
      { id: 611, nombre: 'Santa Cruz de Yojoa' }, { id: 612, nombre: 'Villanueva' },
    ],
  },
  {
    id: 7, code: 'EP', nombre: 'El Paraíso',
    municipios: [
      { id: 701, nombre: 'Yuscarán' }, { id: 702, nombre: 'Alauca' },
      { id: 703, nombre: 'Danlí' }, { id: 704, nombre: 'El Paraíso' },
      { id: 705, nombre: 'Güinope' }, { id: 706, nombre: 'Jacaleapa' },
      { id: 707, nombre: 'Liure' }, { id: 708, nombre: 'Morocelí' },
      { id: 709, nombre: 'Oropolí' }, { id: 710, nombre: 'Potrerillos' },
      { id: 711, nombre: 'San Antonio de Flores' }, { id: 712, nombre: 'San Lucas' },
      { id: 713, nombre: 'San Matías' }, { id: 714, nombre: 'Soledad' },
      { id: 715, nombre: 'Teupasenti' }, { id: 716, nombre: 'Texiguat' },
      { id: 717, nombre: 'Vado Ancho' }, { id: 718, nombre: 'Yauyupe' },
      { id: 719, nombre: 'Trojes' },
    ],
  },
  {
    id: 8, code: 'FM', nombre: 'Francisco Morazán',
    municipios: [
      { id: 801, nombre: 'Tegucigalpa' }, { id: 802, nombre: 'Alubarén' },
      { id: 803, nombre: 'Cedros' }, { id: 804, nombre: 'Curarén' },
      { id: 805, nombre: 'El Porvenir' }, { id: 806, nombre: 'Guaimaca' },
      { id: 807, nombre: 'La Libertad' }, { id: 808, nombre: 'La Venta' },
      { id: 809, nombre: 'Lepaterique' }, { id: 810, nombre: 'Maraita' },
      { id: 811, nombre: 'Marale' }, { id: 812, nombre: 'Nueva Armenia' },
      { id: 813, nombre: 'Ojojona' }, { id: 814, nombre: 'Orica' },
      { id: 815, nombre: 'Reitoca' }, { id: 816, nombre: 'Sabanagrande' },
      { id: 817, nombre: 'San Antonio de Oriente' }, { id: 818, nombre: 'San Buenaventura' },
      { id: 819, nombre: 'San Ignacio' }, { id: 820, nombre: 'San Juan de Flores' },
      { id: 821, nombre: 'San Miguelito' }, { id: 822, nombre: 'Santa Ana' },
      { id: 823, nombre: 'Santa Lucía' }, { id: 824, nombre: 'Talanga' },
      { id: 825, nombre: 'Tatumbla' }, { id: 826, nombre: 'Valle de Ángeles' },
      { id: 827, nombre: 'Villa de San Francisco' }, { id: 828, nombre: 'Vallecillo' },
    ],
  },
  {
    id: 9, code: 'GD', nombre: 'Gracias a Dios',
    municipios: [
      { id: 901, nombre: 'Puerto Lempira' }, { id: 902, nombre: 'Brus Laguna' },
      { id: 903, nombre: 'Ahuas' }, { id: 904, nombre: 'Juan Francisco Bulnes' },
      { id: 905, nombre: 'Villeda Morales' }, { id: 906, nombre: 'Wampusirpe' },
    ],
  },
  {
    id: 10, code: 'IN', nombre: 'Intibucá',
    municipios: [
      { id: 1001, nombre: 'La Esperanza' }, { id: 1002, nombre: 'Camasca' },
      { id: 1003, nombre: 'Colomoncagua' }, { id: 1004, nombre: 'Concepción' },
      { id: 1005, nombre: 'Dolores' }, { id: 1006, nombre: 'Intibucá' },
      { id: 1007, nombre: 'Jesús de Otoro' }, { id: 1008, nombre: 'Magdalena' },
      { id: 1009, nombre: 'Masaguara' }, { id: 1010, nombre: 'San Antonio' },
      { id: 1011, nombre: 'San Francisco de Opalaca' }, { id: 1012, nombre: 'San Isidro' },
      { id: 1013, nombre: 'San Juan' }, { id: 1014, nombre: 'San Marcos de la Sierra' },
      { id: 1015, nombre: 'San Miguelito' }, { id: 1016, nombre: 'Santa Lucía' },
      { id: 1017, nombre: 'Yamaranguila' }, { id: 1018, nombre: 'San Francisco del Valle' },
    ],
  },
  {
    id: 11, code: 'IB', nombre: 'Islas de la Bahía',
    municipios: [
      { id: 1101, nombre: 'Roatán' }, { id: 1102, nombre: 'Guanaja' },
      { id: 1103, nombre: 'José Santos Guardiola' }, { id: 1104, nombre: 'Utila' },
    ],
  },
  {
    id: 12, code: 'LP', nombre: 'La Paz',
    municipios: [
      { id: 1201, nombre: 'La Paz' }, { id: 1202, nombre: 'Aguanqueterique' },
      { id: 1203, nombre: 'Cabañas' }, { id: 1204, nombre: 'Cane' },
      { id: 1205, nombre: 'Chinacla' }, { id: 1206, nombre: 'Guajiquiro' },
      { id: 1207, nombre: 'Lauterique' }, { id: 1208, nombre: 'Marcala' },
      { id: 1209, nombre: 'Mercedes de Oriente' }, { id: 1210, nombre: 'Opatoro' },
      { id: 1211, nombre: 'San Antonio del Norte' }, { id: 1212, nombre: 'San Juan' },
      { id: 1213, nombre: 'San Pedro de Tutule' }, { id: 1214, nombre: 'Santa Ana' },
      { id: 1215, nombre: 'Santa Elena' }, { id: 1216, nombre: 'Santa María' },
      { id: 1217, nombre: 'Santiago de Puringla' }, { id: 1218, nombre: 'Yarula' },
    ],
  },
  {
    id: 13, code: 'LE', nombre: 'Lempira',
    municipios: [
      { id: 1301, nombre: 'Gracias' }, { id: 1302, nombre: 'Belén' },
      { id: 1303, nombre: 'Candelaria' }, { id: 1304, nombre: 'Cololaca' },
      { id: 1305, nombre: 'Erandique' }, { id: 1306, nombre: 'Gualcince' },
      { id: 1307, nombre: 'Guarita' }, { id: 1308, nombre: 'La Campa' },
      { id: 1309, nombre: 'La Iguala' }, { id: 1310, nombre: 'Las Flores' },
      { id: 1311, nombre: 'La Unión' }, { id: 1312, nombre: 'La Virtud' },
      { id: 1313, nombre: 'Lepaera' }, { id: 1314, nombre: 'Mapulaca' },
      { id: 1315, nombre: 'Piraera' }, { id: 1316, nombre: 'San Andrés' },
      { id: 1317, nombre: 'San Francisco' }, { id: 1318, nombre: 'San Juan Guarita' },
      { id: 1319, nombre: 'San Manuel Colohete' }, { id: 1320, nombre: 'San Rafael' },
      { id: 1321, nombre: 'San Sebastián' }, { id: 1322, nombre: 'Santa Cruz' },
      { id: 1323, nombre: 'Talgua' }, { id: 1324, nombre: 'Tambla' },
      { id: 1325, nombre: 'Tomala' }, { id: 1326, nombre: 'Valladolid' },
      { id: 1327, nombre: 'Virginia' }, { id: 1328, nombre: 'San Marcos de Caiquín' },
    ],
  },
  {
    id: 14, code: 'OC', nombre: 'Ocotepeque',
    municipios: [
      { id: 1401, nombre: 'Nueva Ocotepeque' }, { id: 1402, nombre: 'Belén Gualcho' },
      { id: 1403, nombre: 'Concepción' }, { id: 1404, nombre: 'Dolores Merendón' },
      { id: 1405, nombre: 'Fraternidad' }, { id: 1406, nombre: 'La Encarnación' },
      { id: 1407, nombre: 'La Labor' }, { id: 1408, nombre: 'Lucerna' },
      { id: 1409, nombre: 'Mercedes' }, { id: 1410, nombre: 'San Fernando' },
      { id: 1411, nombre: 'San Francisco del Valle' }, { id: 1412, nombre: 'San Jorge' },
      { id: 1413, nombre: 'San Marcos' }, { id: 1414, nombre: 'Santa Fe' },
      { id: 1415, nombre: 'Sensenti' }, { id: 1416, nombre: 'Sinuapa' },
    ],
  },
  {
    id: 15, code: 'OL', nombre: 'Olancho',
    municipios: [
      { id: 1501, nombre: 'Juticalpa' }, { id: 1502, nombre: 'Campamento' },
      { id: 1503, nombre: 'Catacamas' }, { id: 1504, nombre: 'Concordia' },
      { id: 1505, nombre: 'Dulce Nombre de Culmí' }, { id: 1506, nombre: 'El Rosario' },
      { id: 1507, nombre: 'Esquipulas del Norte' }, { id: 1508, nombre: 'Gualaco' },
      { id: 1509, nombre: 'Guarizama' }, { id: 1510, nombre: 'Guata' },
      { id: 1511, nombre: 'Guayape' }, { id: 1512, nombre: 'Jano' },
      { id: 1513, nombre: 'La Unión' }, { id: 1514, nombre: 'Mangulile' },
      { id: 1515, nombre: 'Manto' }, { id: 1516, nombre: 'Salamá' },
      { id: 1517, nombre: 'San Esteban' }, { id: 1518, nombre: 'San Francisco de Becerra' },
      { id: 1519, nombre: 'San Francisco de la Paz' }, { id: 1520, nombre: 'Santa María del Real' },
      { id: 1521, nombre: 'Silca' }, { id: 1522, nombre: 'Yocón' },
      { id: 1523, nombre: 'Patuca' },
    ],
  },
  {
    id: 16, code: 'SB', nombre: 'Santa Bárbara',
    municipios: [
      { id: 1601, nombre: 'Santa Bárbara' }, { id: 1602, nombre: 'Arada' },
      { id: 1603, nombre: 'Atima' }, { id: 1604, nombre: 'Azacualpa' },
      { id: 1605, nombre: 'Ceguaca' }, { id: 1606, nombre: 'Chinda' },
      { id: 1607, nombre: 'Concepción del Norte' }, { id: 1608, nombre: 'Concepción del Sur' },
      { id: 1609, nombre: 'El Níspero' }, { id: 1610, nombre: 'Gualala' },
      { id: 1611, nombre: 'Ilama' }, { id: 1612, nombre: 'Macuelizo' },
      { id: 1613, nombre: 'Naranjito' }, { id: 1614, nombre: 'Nuevo Celilac' },
      { id: 1615, nombre: 'Petoa' }, { id: 1616, nombre: 'Protección' },
      { id: 1617, nombre: 'Quimistán' }, { id: 1618, nombre: 'San Francisco de Ojuera' },
      { id: 1619, nombre: 'San José de Colinas' }, { id: 1620, nombre: 'San Luis' },
      { id: 1621, nombre: 'San Marcos' }, { id: 1622, nombre: 'San Nicolás' },
      { id: 1623, nombre: 'San Pedro Zacapa' }, { id: 1624, nombre: 'Santa Rita' },
      { id: 1625, nombre: 'Trinidad' }, { id: 1626, nombre: 'Las Vegas' },
      { id: 1627, nombre: 'San Vicente Centenario' },
    ],
  },
  {
    id: 17, code: 'VA', nombre: 'Valle',
    municipios: [
      { id: 1701, nombre: 'Nacaome' }, { id: 1702, nombre: 'Alianza' },
      { id: 1703, nombre: 'Amapala' }, { id: 1704, nombre: 'Aramecina' },
      { id: 1705, nombre: 'Caridad' }, { id: 1706, nombre: 'Goascorán' },
      { id: 1707, nombre: 'Langue' }, { id: 1708, nombre: 'San Francisco de Coray' },
      { id: 1709, nombre: 'San Lorenzo' },
    ],
  },
  {
    id: 18, code: 'YO', nombre: 'Yoro',
    municipios: [
      { id: 1801, nombre: 'Yoro' }, { id: 1802, nombre: 'Arenal' },
      { id: 1803, nombre: 'El Negrito' }, { id: 1804, nombre: 'El Progreso' },
      { id: 1805, nombre: 'Jocón' }, { id: 1806, nombre: 'Morazán' },
      { id: 1807, nombre: 'Olanchito' }, { id: 1808, nombre: 'Santa Rita' },
      { id: 1809, nombre: 'Sulaco' }, { id: 1810, nombre: 'Victoria' },
      { id: 1811, nombre: 'Yorito' },
    ],
  },
];

export function getDepartamentoById(id: number): Departamento | undefined {
  return DEPARTAMENTOS.find(d => d.id === id);
}

export function getDepartamentoByNombre(nombre: string): Departamento | undefined {
  return DEPARTAMENTOS.find(d => d.nombre === nombre);
}

export function getDepartamentoByCode(code: string): Departamento | undefined {
  return DEPARTAMENTOS.find(d => d.code === code);
}
