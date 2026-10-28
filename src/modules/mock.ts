import type { FuelDetail } from './fuelsApi'

// Mock работает без БД и без S3: изображения и видео — копии объектов
// из бакета Minio, лежат в public/mock/ самого проекта.
const MEDIA = '/mock'

// Mock-коллекция видов топлива. Формат совпадает с ответом веб-сервиса,
// поэтому страницы не различают, откуда пришли данные.
// У «Этилена» и «Угарного газа» медиа не заполнены — для них
// подставляются изображение и видео по умолчанию из public/.
export const FUELS_MOCK: FuelDetail[] = [
  {
    fuel_id: 1,
    fuel_name: 'Метан',
    combustion_note:
      'Основной компонент природного газа. Полное сгорание идёт по уравнению CH4 + 2O2 -> CO2 + 2H2O. ' +
      'При нормальных условиях один кубометр метана отдаёт 35 800 кДж теплоты, поэтому метан используют ' +
      'как эталон при расчёте тепловой мощности бытовых котлов и промышленных горелок.',
    fuel_status: 'опубликован',
    heat_of_combustion_kj: 35800,
    ignition_temp_c: 537,
    image_url: `${MEDIA}/metan.jpg`,
    video_url: `${MEDIA}/methane.mp4`,
    created_at: '2026-09-14T10:00:00+03:00',
    formed_at: '2026-09-14T10:05:00+03:00',
    creator_login: 'ivanov',
    likes_count: 3,
    is_liked: false,
  },
  {
    fuel_id: 2,
    fuel_name: 'Пропан-бутан',
    combustion_note:
      'Сжиженный углеводородный газ, смесь пропана и бутана в соотношении 50/50. Реакция горения пропана: ' +
      'C3H8 + 5O2 -> 3CO2 + 4H2O. Кубометр смеси при н.у. выделяет около 108 000 кДж — втрое больше метана, ' +
      'поэтому баллонный газ применяют там, где нужна высокая тепловая мощность при малом объёме хранения.',
    fuel_status: 'опубликован',
    heat_of_combustion_kj: 108000,
    ignition_temp_c: 470,
    image_url: `${MEDIA}/propan-bytan.jpg`,
    video_url: `${MEDIA}/propane_butane.mp4`,
    created_at: '2026-09-14T10:10:00+03:00',
    formed_at: '2026-09-14T10:15:00+03:00',
    creator_login: 'ivanov',
    likes_count: 2,
    is_liked: false,
  },
  {
    fuel_id: 3,
    fuel_name: 'Ацетилен',
    combustion_note:
      'Топливо газовой сварки и резки металлов. Полное сгорание: 2C2H2 + 5O2 -> 4CO2 + 2H2O. ' +
      'Кубометр ацетилена при н.у. даёт 56 000 кДж, но главное его достоинство не в теплоте, а в температуре ' +
      'пламени: в смеси с кислородом оно достигает 3150 °C — выше, чем у любого другого промышленного газа.',
    fuel_status: 'опубликован',
    heat_of_combustion_kj: 56000,
    ignition_temp_c: 335,
    image_url: `${MEDIA}/acetilen.png`,
    video_url: `${MEDIA}/acetylene.mp4`,
    created_at: '2026-09-14T10:20:00+03:00',
    formed_at: '2026-09-14T10:25:00+03:00',
    creator_login: 'petrova',
    likes_count: 3,
    is_liked: false,
  },
  {
    fuel_id: 4,
    fuel_name: 'Водород',
    combustion_note:
      'Единственное топливо подборки, при сгорании которого не образуется диоксид углерода: 2H2 + O2 -> 2H2O. ' +
      'Объёмная теплота сгорания самая низкая — 10 800 кДж/м³ при н.у., потому что молекула водорода очень ' +
      'лёгкая, зато на единицу массы водород выделяет 120 000 кДж/кг.',
    fuel_status: 'опубликован',
    heat_of_combustion_kj: 10800,
    ignition_temp_c: 510,
    image_url: `${MEDIA}/vodorod.jpg`,
    video_url: `${MEDIA}/hydrogen.mp4`,
    created_at: '2026-09-14T10:30:00+03:00',
    formed_at: '2026-09-14T10:35:00+03:00',
    creator_login: 'smirnov',
    likes_count: 1,
    is_liked: false,
  },
  {
    fuel_id: 5,
    fuel_name: 'Этилен',
    combustion_note:
      'Сгорает коптящим светящимся пламенем: C2H4 + 3O2 -> 2CO2 + 2H2O. Кубометр этилена при н.у. ' +
      'выделяет около 59 000 кДж. Фото и видео у карточки не загружены — показываются медиа по умолчанию.',
    fuel_status: 'опубликован',
    heat_of_combustion_kj: 59000,
    ignition_temp_c: 450,
    image_url: '',
    video_url: '',
    created_at: '2026-10-20T12:00:00+03:00',
    formed_at: '2026-10-20T12:10:00+03:00',
    creator_login: 'kuznecova',
    likes_count: 0,
    is_liked: false,
  },
  {
    fuel_id: 6,
    fuel_name: 'Угарный газ',
    combustion_note:
      'Оксид углерода горит синим пламенем: 2CO + O2 -> 2CO2. Теплота сгорания — 12 640 кДж/м³ при н.у. ' +
      'Входит в состав генераторного и доменного газов. Медиа у карточки не заполнены.',
    fuel_status: 'опубликован',
    heat_of_combustion_kj: 12640,
    ignition_temp_c: 605,
    image_url: '',
    video_url: '',
    created_at: '2026-10-21T09:00:00+03:00',
    formed_at: '2026-10-21T09:05:00+03:00',
    creator_login: 'smirnov',
    likes_count: 1,
    is_liked: false,
  },
  {
    // Черновик в выдачу гостю не попадает — как и на бэкенде
    fuel_id: 7,
    fuel_name: 'Метано-водородная смесь',
    combustion_note: '',
    fuel_status: 'черновик',
    heat_of_combustion_kj: 0,
    ignition_temp_c: 0,
    image_url: '',
    video_url: '',
    created_at: '2026-10-22T18:00:00+03:00',
    formed_at: null,
    creator_login: 'petrova',
    likes_count: 0,
    is_liked: false,
  },
]
