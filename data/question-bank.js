// Original practice material. Server-only answers; these are not official BAC subjects.
export const BANK = [
 ['m01','matematica','algebra','incepator','Rezolvă 3x + 6 = 21.',['x = 3','x = 5','x = 7','x = 9'],1,'Scădem 6: 3x = 15. Împărțim la 3: x = 5.'],
 ['m02','matematica','algebra','incepator','Descompune x² − 9 în factori.',['(x − 9)(x + 1)','(x − 3)²','(x − 3)(x + 3)','x(x − 9)'],2,'Diferența de pătrate: a² − b² = (a − b)(a + b).'],
 ['m03','matematica','functii','incepator','Pentru f(x) = 2x − 1, cât este f(3)?',['3','4','5','6'],2,'f(3) = 2 · 3 − 1 = 5.'],
 ['m04','matematica','geometrie','incepator','Distanța dintre A(1, 2) și B(4, 6) este:',['3','4','5','7'],2,'AB = √((4−1)² + (6−2)²) = √25 = 5.'],
 ['m05','matematica','algebra','mediu','Dacă x² − 5x + 6 = 0, suma rădăcinilor este:',['2','3','5','6'],2,'Din relațiile lui Viète, suma este −b/a = 5.'],
 ['m06','matematica','functii','mediu','Derivata lui f(x) = x³ − 2x + 1 este:',['3x² − 2','x² − 2','3x² + 1','3x − 2'],0,'Derivăm termen cu termen: 3x² − 2 + 0.'],
 ['m07','matematica','geometrie','mediu','Panta dreptei prin A(1, 2) și B(3, 8) este:',['2','3','4','6'],1,'m = (8−2)/(3−1) = 3.'],
 ['m08','matematica','algebra','mediu','Determinantul matricei cu liniile (2, 1) și (3, 4) este:',['5','8','11','−5'],0,'det A = 2 · 4 − 1 · 3 = 5.'],
 ['m09','matematica','functii','avansat','Integrala de la 0 la 1 din 2x dx este:',['0','1','2','1/2'],1,'O primitivă este x². Rezultă 1² − 0² = 1.'],
 ['m10','matematica','algebra','avansat','Pentru x ★ y = x + y + 2 pe ℝ, neutrul este:',['0','1','−2','2'],2,'x + e + 2 = x implică e = −2.'],
 ['m11','matematica','functii','avansat','Limita când x → 0 a lui sin x / x (în radiani) este:',['0','1','∞','−1'],1,'Limita fundamentală trigonometrică este 1.'],
 ['m12','matematica','geometrie','avansat','Distanța de la origine la 3x + 4y − 10 = 0 este:',['1','2','5','10'],1,'d = 10/√(9+16) = 2.'],
 ['m13','matematica','algebra','incepator','Cât este (2x + 1)²?',['4x² + 1','4x² + 2x + 1','4x² + 4x + 1','2x² + 1'],2,'Folosim (a+b)² = a² + 2ab + b².'],
 ['m14','matematica','functii','mediu','f(x) = −2x + 3 este:',['strict crescătoare','strict descrescătoare','constantă','pară'],1,'Panta este negativă: −2 < 0.'],
 ['m15','matematica','algebra','avansat','Pentru x ★ y = x + y − 3, simetricul lui 8 este:',['−8','−5','−2','2'],2,'Neutrul este 3. Din 8+y−3=3 rezultă y=−2.'],
 ['r01','romana','gramatica','incepator','În „Elevul citește”, „citește” este:',['substantiv','verb','adjectiv','pronume'],1,'Exprimă acțiunea și este verb la indicativ prezent.'],
 ['r02','romana','literatura','incepator','Cine a scris „Luceafărul”?',['George Bacovia','Tudor Arghezi','Mihai Eminescu','Lucian Blaga'],2,'„Luceafărul” este un poem de Mihai Eminescu.'],
 ['r03','romana','argumentare','incepator','Un text argumentativ urmărește:',['descrierea unui peisaj','susținerea unei opinii prin argumente','enumerarea personajelor','reproducerea unei conversații'],1,'Argumentarea susține un punct de vedere prin raționamente și exemple.'],
 ['r04','romana','gramatica','incepator','Alege forma corectă:',['Nu fii trist!','Nu fi trist!','Nu fii tristt!','Nu fi-i trist!'],1,'Imperativul negativ al verbului „a fi”, persoana a II-a singular, este „nu fi”.'],
 ['r05','romana','literatura','mediu','„Plumb” de George Bacovia este asociată cu:',['clasicismul','simbolismul','realismul','iluminismul'],1,'Sugestia, repetiția și corespondențele sunt trăsături simboliste.'],
 ['r06','romana','literatura','mediu','Autorul romanului „Ion” este:',['Liviu Rebreanu','Marin Preda','Ioan Slavici','Camil Petrescu'],0,'Romanul „Ion” a fost scris de Liviu Rebreanu.'],
 ['r07','romana','argumentare','mediu','Ce conector introduce o concluzie?',['de exemplu','în primul rând','prin urmare','pe de altă parte'],2,'„Prin urmare” introduce o consecință sau concluzie.'],
 ['r08','romana','gramatica','mediu','În „ochii ca două stele”, figura de stil este:',['comparația','enumerația','hiperbola','inversiunea'],0,'Elementele sunt comparate prin termenul „ca”.'],
 ['r09','romana','literatura','avansat','Naratorul omniscient:',['este mereu personaj principal','cunoaște inclusiv gândurile personajelor','povestește exclusiv la persoana I','nu poate descrie trecutul'],1,'Omnisciența presupune acces inclusiv la interioritatea personajelor.'],
 ['r10','romana','literatura','avansat','„Ultima noapte de dragoste, întâia noapte de război” valorifică:',['perspectiva subiectivă și analiza conștiinței','doar relatarea omniscientă','exclusiv fantasticul','structura unei fabule'],0,'Romanul lui Camil Petrescu urmărește experiența și conștiința lui Ștefan Gheorghidiu.'],
 ['r11','romana','argumentare','avansat','Ce susține cel mai bine un argument?',['repetarea opiniei','un exemplu relevant, explicat în raport cu ideea','o afirmație fără legătură','un citat neverificat'],1,'Exemplul trebuie interpretat și legat de argument.'],
 ['r12','romana','literatura','avansat','Conflictul interior reprezintă:',['o confruntare exclusiv fizică','tensiunea dintre dorințe, valori sau decizii','doar un conflict cu natura','absența alegerilor'],1,'Conflictul interior se desfășoară în conștiința personajului.'],
 ['r13','romana','literatura','incepator','„O scrisoare pierdută” este:',['roman','comedie','nuvelă','elegie'],1,'Opera lui I. L. Caragiale este o comedie.'],
 ['r14','romana','gramatica','mediu','În „Cartea este interesantă”, „interesantă” este:',['verb','adjectiv','adverb','prepoziție'],1,'Adjectivul se acordă cu substantivul „cartea”.'],
 ['r15','romana','literatura','avansat','„Moara cu noroc” urmărește:',['efectele dorinței de îmbogățire asupra lui Ghiță','aventurile lui Harap-Alb','copilăria lui Nică','viața lui Ion al Glanetașului'],0,'Nuvela lui Ioan Slavici explorează degradarea morală în relație cu dorința de câștig.']
].map(([id,subject,topic,level,prompt,options,correct,explanation])=>({id,subject,topic,level,prompt,options,correct,explanation}));

export function chooseQuestions(subject,level,previous=[],focus='toate') {
 const levels=['incepator','mediu','avansat'], misses=new Map();
 for(const a of previous){if(!a.answers)continue;let answers,items;try{answers=JSON.parse(a.answers);items=JSON.parse(a.items);}catch{continue;}
  for(const id of items){const q=BANK.find(q=>q.id===id);if(q&&answers[id]!==q.correct)misses.set(q.topic,(misses.get(q.topic)||0)+1);}}
 return BANK.filter(q=>q.subject===subject&&(focus==='toate'||q.topic===focus)).map(q=>({q,w:(misses.get(q.topic)||0)*3+(q.level===level?4:0)-Math.abs(levels.indexOf(q.level)-levels.indexOf(level))+crypto.getRandomValues(new Uint32Array(1))[0]/2**32})).sort((a,b)=>b.w-a.w).slice(0,6).map(x=>x.q);
}
