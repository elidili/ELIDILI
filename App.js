import { useState, useEffect, useRef } from "react";

const callAI = async (system, userMsg, history = []) => {
  const msgs = history.length ? [...history, {role:"user",content:userMsg}] : [{role:"user",content:userMsg}];
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,system,messages:msgs}),
  });
  const d = await res.json();
  return d.content?.[0]?.text || "✦ Try again!";
};

const DB = {
  get:(k)=>{ try{return JSON.parse(localStorage.getItem(k))}catch{return null} },
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v)),
};

const UI_LANGS = {
  en:{flag:"🇬🇧",name:"English",dir:"ltr"},
  da:{flag:"🇩🇰",name:"Dansk",dir:"ltr"},
  de:{flag:"🇩🇪",name:"Deutsch",dir:"ltr"},
  fr:{flag:"🇫🇷",name:"Français",dir:"ltr"},
  es:{flag:"🇪🇸",name:"Español",dir:"ltr"},
  ar:{flag:"🇸🇦",name:"العربية",dir:"rtl"},
  fa:{flag:"🇮🇷",name:"فارسی",dir:"rtl"},
  tr:{flag:"🇹🇷",name:"Türkçe",dir:"ltr"},
  it:{flag:"🇮🇹",name:"Italiano",dir:"ltr"},
  pt:{flag:"🇧🇷",name:"Português",dir:"ltr"},
  ru:{flag:"🇷🇺",name:"Русский",dir:"ltr"},
  zh:{flag:"🇨🇳",name:"中文",dir:"ltr"},
  ja:{flag:"🇯🇵",name:"日本語",dir:"ltr"},
  ko:{flag:"🇰🇷",name:"한국어",dir:"ltr"},
  hi:{flag:"🇮🇳",name:"हिन्दी",dir:"ltr"},
};

const T = {
  en:{appName:"Eli & Dili",tagline:"Your AI bestie for content, chat & more.",letsgo:"Let's go →",ready:"I'm ready →",yourname:"What's your name?",nameHint:"your name...",start:"Start",greetM:"Good Morning",greetA:"Good Afternoon",greetE:"Good Evening",freeUses:"Free uses today",upgrade:"Upgrade for unlimited →",proMember:"Pro Member",allUnlocked:"All tools unlocked",tools:"Tools",goPro:"Go Pro",goProSub:"Unlock everything. No limits.",perMonth:"/ month • Cancel anytime",startPro:"Start Pro — €5/month ✦",secure:"Secure • GDPR compliant • Cancel anytime",memberSince:"Member since",aiUses:"AI uses",plan:"Plan",signOut:"Sign Out",upgradeTo:"Upgrade to Pro",copy:"Copy ✦",generate:"Generate",result:"Result ✦",saySmth:"Say something...",typeText:"Type text to translate...",descPhoto:"Describe your photo or topic...",whatWrite:"What do you want me to write?",descYou:"Describe yourself or your brand...",pasteMsg:"Paste the message or comment...",style:"Style",home:"Home",pro:"Pro",me:"Me",onlyEur:"Only €5/month",perks:["Unlimited AI uses","All 6 tools unlocked","Faster responses","Priority support","New tools first"],chatIntro:"Hey! I'm Eli, your AI bestie 👋 What's on your mind?",language:"Language",free:"Free",locked:"PRO"},
  da:{appName:"Eli & Dili",tagline:"Din AI-ven til indhold, chat og mere.",letsgo:"Lad os starte →",ready:"Jeg er klar →",yourname:"Hvad hedder du?",nameHint:"dit navn...",start:"Start",greetM:"God morgen",greetA:"God eftermiddag",greetE:"God aften",freeUses:"Gratis brug i dag",upgrade:"Opgrader for ubegrænset →",proMember:"Pro-medlem",allUnlocked:"Alle værktøjer låst op",tools:"Værktøjer",goPro:"Bliv Pro",goProSub:"Lås alt op. Ingen grænser.",perMonth:"/ måned • Afmeld når som helst",startPro:"Start Pro — €5/måned ✦",secure:"Sikker • GDPR • Afmeld når som helst",memberSince:"Medlem siden",aiUses:"AI-brug",plan:"Plan",signOut:"Log ud",upgradeTo:"Opgrader til Pro",copy:"Kopiér ✦",generate:"Generer",result:"Resultat ✦",saySmth:"Sig noget...",typeText:"Skriv tekst til oversættelse...",descPhoto:"Beskriv dit foto eller emne...",whatWrite:"Hvad skal jeg skrive?",descYou:"Beskriv dig selv eller dit brand...",pasteMsg:"Indsæt beskeden...",style:"Stil",home:"Hjem",pro:"Pro",me:"Mig",onlyEur:"Kun €5/måned",perks:["Ubegrænset AI","Alle 6 værktøjer","Hurtigere svar","Prioriteret support","Nye værktøjer først"],chatIntro:"Hej! Jeg er Eli 👋 Hvad tænker du på?",language:"Sprog",free:"Gratis",locked:"PRO"},
  de:{appName:"Eli & Dili",tagline:"Dein KI-Begleiter für Inhalte, Chat und mehr.",letsgo:"Los geht's →",ready:"Ich bin bereit →",yourname:"Wie heißt du?",nameHint:"dein Name...",start:"Starten",greetM:"Guten Morgen",greetA:"Guten Nachmittag",greetE:"Guten Abend",freeUses:"Kostenlose Nutzungen heute",upgrade:"Upgrade für unbegrenzte Nutzung →",proMember:"Pro-Mitglied",allUnlocked:"Alle Tools freigeschaltet",tools:"Tools",goPro:"Pro werden",goProSub:"Alles freischalten. Keine Grenzen.",perMonth:"/ Monat • Jederzeit kündbar",startPro:"Pro starten — €5/Monat ✦",secure:"Sicher • DSGVO • Jederzeit kündbar",memberSince:"Mitglied seit",aiUses:"KI-Nutzungen",plan:"Plan",signOut:"Abmelden",upgradeTo:"Auf Pro upgraden",copy:"Kopieren ✦",generate:"Generieren",result:"Ergebnis ✦",saySmth:"Sag etwas...",typeText:"Text zum Übersetzen...",descPhoto:"Beschreibe dein Foto...",whatWrite:"Was soll ich schreiben?",descYou:"Beschreibe dich oder deine Marke...",pasteMsg:"Nachricht einfügen...",style:"Stil",home:"Start",pro:"Pro",me:"Ich",onlyEur:"Nur €5/Monat",perks:["Unbegrenzte KI","Alle 6 Tools","Schnellere Antworten","Prioritätssupport","Neue Tools zuerst"],chatIntro:"Hey! Ich bin Eli 👋 Was beschäftigt dich?",language:"Sprache",free:"Kostenlos",locked:"PRO"},
  fr:{appName:"Eli & Dili",tagline:"Ton assistant IA pour le contenu, le chat et plus.",letsgo:"C'est parti →",ready:"Je suis prêt →",yourname:"Comment tu t'appelles?",nameHint:"ton prénom...",start:"Commencer",greetM:"Bonjour",greetA:"Bon après-midi",greetE:"Bonsoir",freeUses:"Utilisations gratuites aujourd'hui",upgrade:"Passer à l'illimité →",proMember:"Membre Pro",allUnlocked:"Tous les outils débloqués",tools:"Outils",goPro:"Passer Pro",goProSub:"Tout débloquer. Sans limites.",perMonth:"/ mois • Annulez quand vous voulez",startPro:"Démarrer Pro — €5/mois ✦",secure:"Sécurisé • RGPD • Annulez quand vous voulez",memberSince:"Membre depuis",aiUses:"Utilisations IA",plan:"Plan",signOut:"Déconnexion",upgradeTo:"Passer à Pro",copy:"Copier ✦",generate:"Générer",result:"Résultat ✦",saySmth:"Dis quelque chose...",typeText:"Texte à traduire...",descPhoto:"Décris ta photo...",whatWrite:"Qu'est-ce que je dois écrire?",descYou:"Décris-toi ou ta marque...",pasteMsg:"Colle le message...",style:"Style",home:"Accueil",pro:"Pro",me:"Moi",onlyEur:"Seulement €5/mois",perks:["IA illimitée","6 outils débloqués","Réponses plus rapides","Support prioritaire","Nouveaux outils en premier"],chatIntro:"Salut! Je suis Eli 👋 À quoi tu penses?",language:"Langue",free:"Gratuit",locked:"PRO"},
  es:{appName:"Eli & Dili",tagline:"Tu asistente IA para contenido, chat y más.",letsgo:"¡Vamos! →",ready:"Estoy listo →",yourname:"¿Cómo te llamas?",nameHint:"tu nombre...",start:"Empezar",greetM:"Buenos días",greetA:"Buenas tardes",greetE:"Buenas noches",freeUses:"Usos gratuitos hoy",upgrade:"Actualizar para ilimitado →",proMember:"Miembro Pro",allUnlocked:"Todas las herramientas desbloqueadas",tools:"Herramientas",goPro:"Hazte Pro",goProSub:"Desbloquea todo. Sin límites.",perMonth:"/ mes • Cancela cuando quieras",startPro:"Empezar Pro — €5/mes ✦",secure:"Seguro • GDPR • Cancela cuando quieras",memberSince:"Miembro desde",aiUses:"Usos de IA",plan:"Plan",signOut:"Cerrar sesión",upgradeTo:"Actualizar a Pro",copy:"Copiar ✦",generate:"Generar",result:"Resultado ✦",saySmth:"Di algo...",typeText:"Escribe texto para traducir...",descPhoto:"Describe tu foto...",whatWrite:"¿Qué quieres que escriba?",descYou:"Descríbete o describe tu marca...",pasteMsg:"Pega el mensaje...",style:"Estilo",home:"Inicio",pro:"Pro",me:"Yo",onlyEur:"Solo €5/mes",perks:["IA ilimitada","6 herramientas","Respuestas más rápidas","Soporte prioritario","Nuevas herramientas primero"],chatIntro:"¡Hola! Soy Eli 👋 ¿En qué piensas?",language:"Idioma",free:"Gratis",locked:"PRO"},
  ar:{appName:"Eli & Dili",tagline:"رفيقك الذكي للمحتوى والدردشة والمزيد.",letsgo:"هيا بنا →",ready:"أنا مستعد →",yourname:"ما اسمك؟",nameHint:"اسمك...",start:"ابدأ",greetM:"صباح الخير",greetA:"مساء الخير",greetE:"مساء النور",freeUses:"استخدامات مجانية اليوم",upgrade:"ترقية للاستخدام غير المحدود →",proMember:"عضو Pro",allUnlocked:"جميع الأدوات مفتوحة",tools:"الأدوات",goPro:"احصل على Pro",goProSub:"افتح كل شيء. بلا حدود.",perMonth:"/ شهر • إلغاء في أي وقت",startPro:"ابدأ Pro — €5/شهر ✦",secure:"آمن • GDPR • إلغاء في أي وقت",memberSince:"عضو منذ",aiUses:"استخدامات الذكاء الاصطناعي",plan:"الخطة",signOut:"تسجيل الخروج",upgradeTo:"ترقية إلى Pro",copy:"نسخ ✦",generate:"توليد",result:"النتيجة ✦",saySmth:"قل شيئاً...",typeText:"اكتب النص للترجمة...",descPhoto:"صف صورتك أو موضوعك...",whatWrite:"ماذا تريد مني أن أكتب؟",descYou:"صف نفسك أو علامتك...",pasteMsg:"الصق الرسالة...",style:"الأسلوب",home:"الرئيسية",pro:"Pro",me:"أنا",onlyEur:"فقط €5/شهر",perks:["ذكاء اصطناعي غير محدود","6 أدوات مفتوحة","ردود أسرع","دعم أولوية","أدوات جديدة أولاً"],chatIntro:"مرحباً! أنا Eli 👋 ماذا في ذهنك؟",language:"اللغة",free:"مجاني",locked:"PRO"},
  fa:{appName:"Eli & Dili",tagline:"دستیار هوشمند تو برای محتوا، چت و بیشتر.",letsgo:"بزن بریم →",ready:"آماده‌ام →",yourname:"اسمت چیه؟",nameHint:"اسمت...",start:"شروع",greetM:"صبح بخیر",greetA:"عصر بخیر",greetE:"شب بخیر",freeUses:"استفاده رایگان امروز",upgrade:"ارتقا برای نامحدود →",proMember:"عضو Pro",allUnlocked:"همه ابزارها باز شدن",tools:"ابزارها",goPro:"Pro بشو",goProSub:"همه چیز رو باز کن. بدون محدودیت.",perMonth:"/ ماه • هر وقت خواستی لغو کن",startPro:"شروع Pro — €5/ماه ✦",secure:"امن • GDPR • لغو در هر زمان",memberSince:"عضو از",aiUses:"استفاده از AI",plan:"پلن",signOut:"خروج",upgradeTo:"ارتقا به Pro",copy:"کپی ✦",generate:"تولید",result:"نتیجه ✦",saySmth:"چیزی بگو...",typeText:"متن برای ترجمه...",descPhoto:"عکست یا موضوع رو توضیح بده...",whatWrite:"چی می‌خوای بنویسم؟",descYou:"خودت یا برندت رو توضیح بده...",pasteMsg:"پیام یا کامنت رو بذار...",style:"سبک",home:"خانه",pro:"Pro",me:"من",onlyEur:"فقط €5/ماه",perks:["AI نامحدود","۶ ابزار باز شده","پاسخ سریع‌تر","پشتیبانی اولویت‌دار","ابزارهای جدید اول"],chatIntro:"سلام! من Eli هستم 👋 چی تو ذهنته؟",language:"زبان",free:"رایگان",locked:"PRO"},
  tr:{appName:"Eli & Dili",tagline:"İçerik, sohbet ve daha fazlası için AI arkadaşın.",letsgo:"Hadi gidelim →",ready:"Hazırım →",yourname:"Adın ne?",nameHint:"adın...",start:"Başla",greetM:"Günaydın",greetA:"İyi öğleden sonralar",greetE:"İyi akşamlar",freeUses:"Bugünkü ücretsiz kullanım",upgrade:"Sınırsız için yükselt →",proMember:"Pro Üye",allUnlocked:"Tüm araçlar açıldı",tools:"Araçlar",goPro:"Pro Ol",goProSub:"Her şeyin kilidini aç. Sınır yok.",perMonth:"/ ay • İstediğinde iptal et",startPro:"Pro'ya Başla — €5/ay ✦",secure:"Güvenli • GDPR • İptal et",memberSince:"Üyelik tarihi",aiUses:"AI kullanımı",plan:"Plan",signOut:"Çıkış Yap",upgradeTo:"Pro'ya Yükselt",copy:"Kopyala ✦",generate:"Oluştur",result:"Sonuç ✦",saySmth:"Bir şey söyle...",typeText:"Çevrilecek metni gir...",descPhoto:"Fotoğrafını açıkla...",whatWrite:"Ne yazmamı istersin?",descYou:"Kendini veya markanı açıkla...",pasteMsg:"Mesajı yapıştır...",style:"Stil",home:"Ana Sayfa",pro:"Pro",me:"Ben",onlyEur:"Sadece €5/ay",perks:["Sınırsız AI","6 araç açıldı","Daha hızlı yanıtlar","Öncelikli destek","Yeni araçlar önce"],chatIntro:"Hey! Ben Eli 👋 Ne düşünüyorsun?",language:"Dil",free:"Ücretsiz",locked:"PRO"},
  it:{appName:"Eli & Dili",tagline:"Il tuo assistente AI per contenuti, chat e altro.",letsgo:"Andiamo →",ready:"Sono pronto →",yourname:"Come ti chiami?",nameHint:"il tuo nome...",start:"Inizia",greetM:"Buongiorno",greetA:"Buon pomeriggio",greetE:"Buonasera",freeUses:"Utilizzi gratuiti oggi",upgrade:"Aggiorna per illimitato →",proMember:"Membro Pro",allUnlocked:"Tutti gli strumenti sbloccati",tools:"Strumenti",goPro:"Vai Pro",goProSub:"Sblocca tutto. Nessun limite.",perMonth:"/ mese • Annulla quando vuoi",startPro:"Inizia Pro — €5/mese ✦",secure:"Sicuro • GDPR • Annulla quando vuoi",memberSince:"Membro da",aiUses:"Utilizzi AI",plan:"Piano",signOut:"Esci",upgradeTo:"Aggiorna a Pro",copy:"Copia ✦",generate:"Genera",result:"Risultato ✦",saySmth:"Di' qualcosa...",typeText:"Testo da tradurre...",descPhoto:"Descrivi la tua foto...",whatWrite:"Cosa vuoi che scriva?",descYou:"Descriviti o descrivi il tuo brand...",pasteMsg:"Incolla il messaggio...",style:"Stile",home:"Home",pro:"Pro",me:"Io",onlyEur:"Solo €5/mese",perks:["AI illimitata","6 strumenti","Risposte più veloci","Supporto prioritario","Nuovi strumenti prima"],chatIntro:"Ciao! Sono Eli 👋 A cosa pensi?",language:"Lingua",free:"Gratuito",locked:"PRO"},
  pt:{appName:"Eli & Dili",tagline:"Seu assistente de IA para conteúdo, chat e mais.",letsgo:"Vamos lá →",ready:"Estou pronto →",yourname:"Qual é o seu nome?",nameHint:"seu nome...",start:"Começar",greetM:"Bom dia",greetA:"Boa tarde",greetE:"Boa noite",freeUses:"Usos gratuitos hoje",upgrade:"Atualizar para ilimitado →",proMember:"Membro Pro",allUnlocked:"Todas as ferramentas desbloqueadas",tools:"Ferramentas",goPro:"Torne-se Pro",goProSub:"Desbloqueie tudo. Sem limites.",perMonth:"/ mês • Cancele quando quiser",startPro:"Iniciar Pro — €5/mês ✦",secure:"Seguro • GDPR • Cancele quando quiser",memberSince:"Membro desde",aiUses:"Usos de IA",plan:"Plano",signOut:"Sair",upgradeTo:"Atualizar para Pro",copy:"Copiar ✦",generate:"Gerar",result:"Resultado ✦",saySmth:"Diga algo...",typeText:"Digite o texto para traduzir...",descPhoto:"Descreva sua foto...",whatWrite:"O que você quer que eu escreva?",descYou:"Descreva você ou sua marca...",pasteMsg:"Cole a mensagem...",style:"Estilo",home:"Início",pro:"Pro",me:"Eu",onlyEur:"Apenas €5/mês",perks:["IA ilimitada","6 ferramentas","Respostas mais rápidas","Suporte prioritário","Novas ferramentas primeiro"],chatIntro:"Oi! Eu sou Eli 👋 O que você está pensando?",language:"Idioma",free:"Grátis",locked:"PRO"},
  ru:{appName:"Eli & Dili",tagline:"Твой AI-помощник для контента, чата и не только.",letsgo:"Поехали →",ready:"Я готов →",yourname:"Как тебя зовут?",nameHint:"твоё имя...",start:"Начать",greetM:"Доброе утро",greetA:"Добрый день",greetE:"Добрый вечер",freeUses:"Бесплатные использования сегодня",upgrade:"Обновить для безлимита →",proMember:"Pro-участник",allUnlocked:"Все инструменты разблокированы",tools:"Инструменты",goPro:"Стать Pro",goProSub:"Разблокируй всё. Без ограничений.",perMonth:"/ мес • Отмени когда угодно",startPro:"Начать Pro — €5/мес ✦",secure:"Безопасно • GDPR • Отмена в любое время",memberSince:"Участник с",aiUses:"Использования AI",plan:"План",signOut:"Выйти",upgradeTo:"Обновить до Pro",copy:"Копировать ✦",generate:"Создать",result:"Результат ✦",saySmth:"Скажи что-нибудь...",typeText:"Введи текст для перевода...",descPhoto:"Опиши фото или тему...",whatWrite:"Что ты хочешь, чтобы я написал?",descYou:"Опиши себя или свой бренд...",pasteMsg:"Вставь сообщение...",style:"Стиль",home:"Главная",pro:"Pro",me:"Я",onlyEur:"Всего €5/мес",perks:["Безлимитный AI","6 инструментов","Быстрые ответы","Приоритетная поддержка","Новые инструменты первыми"],chatIntro:"Привет! Я Eli 👋 О чём думаешь?",language:"Язык",free:"Бесплатно",locked:"PRO"},
  zh:{appName:"Eli & Dili",tagline:"你的AI内容、聊天助手。",letsgo:"开始吧 →",ready:"我准备好了 →",yourname:"你叫什么名字？",nameHint:"你的名字...",start:"开始",greetM:"早上好",greetA:"下午好",greetE:"晚上好",freeUses:"今日免费使用次数",upgrade:"升级无限使用 →",proMember:"Pro会员",allUnlocked:"所有工具已解锁",tools:"工具",goPro:"升级Pro",goProSub:"解锁一切。无限制。",perMonth:"/ 月 • 随时取消",startPro:"开始Pro — €5/月 ✦",secure:"安全 • GDPR • 随时取消",memberSince:"加入时间",aiUses:"AI使用次数",plan:"计划",signOut:"退出",upgradeTo:"升级到Pro",copy:"复制 ✦",generate:"生成",result:"结果 ✦",saySmth:"说点什么...",typeText:"输入要翻译的文字...",descPhoto:"描述你的照片...",whatWrite:"你想让我写什么？",descYou:"描述你自己或你的品牌...",pasteMsg:"粘贴消息...",style:"风格",home:"首页",pro:"Pro",me:"我",onlyEur:"仅€5/月",perks:["无限AI","6个工具","更快的回复","优先支持","优先体验新工具"],chatIntro:"嗨！我是Eli 👋 你在想什么？",language:"语言",free:"免费",locked:"PRO"},
  ja:{appName:"Eli & Dili",tagline:"コンテンツ・チャットのためのAI友達。",letsgo:"さあ始めよう →",ready:"準備完了 →",yourname:"お名前は？",nameHint:"あなたの名前...",start:"始める",greetM:"おはようございます",greetA:"こんにちは",greetE:"こんばんは",freeUses:"本日の無料使用回数",upgrade:"無制限にアップグレード →",proMember:"Proメンバー",allUnlocked:"全ツール解放済み",tools:"ツール",goPro:"Proになる",goProSub:"全てを解放。制限なし。",perMonth:"/ 月 • いつでもキャンセル",startPro:"Pro開始 — €5/月 ✦",secure:"安全 • GDPR • いつでもキャンセル",memberSince:"メンバー登録日",aiUses:"AI使用回数",plan:"プラン",signOut:"サインアウト",upgradeTo:"Proにアップグレード",copy:"コピー ✦",generate:"生成",result:"結果 ✦",saySmth:"何か言って...",typeText:"翻訳するテキストを入力...",descPhoto:"写真やトピックを説明...",whatWrite:"何を書いてほしいですか？",descYou:"自分やブランドを説明...",pasteMsg:"メッセージを貼り付け...",style:"スタイル",home:"ホーム",pro:"Pro",me:"私",onlyEur:"€5/月のみ",perks:["無制限AI","6ツール解放","より速い応答","優先サポート","新ツールを最初に"],chatIntro:"やあ！Eliです 👋 何を考えていますか？",language:"言語",free:"無料",locked:"PRO"},
  ko:{appName:"Eli & Dili",tagline:"콘텐츠, 채팅 등을 위한 AI 친구.",letsgo:"시작해요 →",ready:"준비됐어요 →",yourname:"이름이 뭐예요?",nameHint:"이름...",start:"시작",greetM:"좋은 아침이에요",greetA:"좋은 오후예요",greetE:"좋은 저녁이에요",freeUses:"오늘 무료 사용 횟수",upgrade:"무제한으로 업그레이드 →",proMember:"Pro 회원",allUnlocked:"모든 도구 잠금 해제됨",tools:"도구",goPro:"Pro 되기",goProSub:"모든 것을 잠금 해제. 제한 없음.",perMonth:"/ 월 • 언제든지 취소",startPro:"Pro 시작 — €5/월 ✦",secure:"안전 • GDPR • 언제든지 취소",memberSince:"가입일",aiUses:"AI 사용 횟수",plan:"플랜",signOut:"로그아웃",upgradeTo:"Pro로 업그레이드",copy:"복사 ✦",generate:"생성",result:"결과 ✦",saySmth:"무언가 말해봐요...",typeText:"번역할 텍스트 입력...",descPhoto:"사진이나 주제를 설명해요...",whatWrite:"무엇을 써드릴까요?",descYou:"자신이나 브랜드를 설명해요...",pasteMsg:"메시지를 붙여넣어요...",style:"스타일",home:"홈",pro:"Pro",me:"나",onlyEur:"€5/월만",perks:["무제한 AI","6개 도구","더 빠른 응답","우선 지원","새 도구 먼저"],chatIntro:"안녕! 나는 Eli야 👋 무슨 생각해?",language:"언어",free:"무료",locked:"PRO"},
  hi:{appName:"Eli & Dili",tagline:"कंटेंट, चैट और बहुत कुछ के लिए आपका AI दोस्त।",letsgo:"चलो शुरू करें →",ready:"मैं तैयार हूं →",yourname:"आपका नाम क्या है?",nameHint:"आपका नाम...",start:"शुरू करें",greetM:"सुप्रभात",greetA:"शुभ दोपहर",greetE:"शुभ संध्या",freeUses:"आज के मुफ्त उपयोग",upgrade:"असीमित के लिए अपग्रेड करें →",proMember:"Pro सदस्य",allUnlocked:"सभी टूल्स अनलॉक",tools:"टूल्स",goPro:"Pro बनें",goProSub:"सब कुछ अनलॉक करें। कोई सीमा नहीं।",perMonth:"/ माह • कभी भी रद्द करें",startPro:"Pro शुरू करें — €5/माह ✦",secure:"सुरक्षित • GDPR • कभी भी रद्द करें",memberSince:"सदस्य बने",aiUses:"AI उपयोग",plan:"प्लान",signOut:"साइन आउट",upgradeTo:"Pro में अपग्रेड करें",copy:"कॉपी करें ✦",generate:"बनाएं",result:"परिणाम ✦",saySmth:"कुछ कहें...",typeText:"अनुवाद के लिए टेक्स्ट टाइप करें...",descPhoto:"अपनी फोटो बताएं...",whatWrite:"आप क्या लिखवाना चाहते हैं?",descYou:"अपने आप या ब्रांड के बारे में बताएं...",pasteMsg:"संदेश पेस्ट करें...",style:"शैली",home:"होम",pro:"Pro",me:"मैं",onlyEur:"केवल €5/माह",perks:["असीमित AI","6 टूल्स अनलॉक","तेज़ जवाब","प्राथमिकता सहायता","नए टूल्स पहले"],chatIntro:"नमस्ते! मैं Eli हूं 👋 क्या सोच रहे हैं?",language:"भाषा",free:"मुफ्त",locked:"PRO"},
};

const TOOLS_DEF = [
  {id:"chat",     emoji:"🤖",label:"AI Bestie",     color:"#00FFD1",free:true},
  {id:"caption",  emoji:"📸",label:"Caption Drop",  color:"#FF2D78",free:true},
  {id:"translate",emoji:"🌍",label:"Vibe Translate",color:"#FFD600",free:true},
  {id:"write",    emoji:"✍️",label:"Write Anything",color:"#A259FF",free:false},
  {id:"bio",      emoji:"⚡",label:"Bio Builder",   color:"#FF6B2B",free:false},
  {id:"reply",    emoji:"💬",label:"Reply King",    color:"#00B4FF",free:false},
];

const TRANSLATE_LANGS = ["English 🇬🇧","Danish 🇩🇰","German 🇩🇪","French 🇫🇷","Spanish 🇪🇸","Arabic 🇸🇦","Persian 🇮🇷","Turkish 🇹🇷","Italian 🇮🇹","Portuguese 🇧🇷","Russian 🇷🇺","Chinese 🇨🇳","Japanese 🇯🇵","Korean 🇰🇷","Hindi 🇮🇳"];
const CAP_STYLES = ["Trendy 🔥","Aesthetic 🌙","Funny 😂","Motivational 💪","Dark 🖤","Romantic 💕","Minimalist ✨","Chaotic 🤪"];
const greetStr = (t) => { const h=new Date().getHours(); return h<12?t.greetM:h<18?t.greetA:t.greetE; };

/* ════ STYLES ════ */
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    html,body{height:100%;background:#060610;overscroll-behavior:none}
    ::-webkit-scrollbar{display:none}
    input,button,textarea,select{font-family:'DM Sans',sans-serif}
    button{cursor:pointer} button:active{transform:scale(0.95);transition:transform .1s}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pop{0%{transform:scale(0.85);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
    .fadeUp{animation:fadeUp .45s ease both}
    .float{animation:float 4s ease-in-out infinite}
    .shimmer-text{background:linear-gradient(90deg,#00FFD1,#FF2D78,#FFD600,#A259FF,#00FFD1);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 5s linear infinite}
    .pop{animation:pop .3s ease both}
  `}</style>
);

const Mesh = ({c="#00FFD1"}) => (
  <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
    <div style={{position:"absolute",width:500,height:500,top:-150,right:-120,borderRadius:"50%",background:`radial-gradient(circle,${c}18 0%,transparent 65%)`,transition:"background 1.5s"}}/>
    <div style={{position:"absolute",width:400,height:400,bottom:-80,left:-100,borderRadius:"50%",background:"radial-gradient(circle,#FF2D7812 0%,transparent 65%)"}}/>
    <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.02) 3px,rgba(0,0,0,.02) 4px)"}}/>
  </div>
);

/* ════ LANG SWITCHER ════ */
function LangSwitcher({lang,setLang}) {
  const [open,setOpen] = useState(false);
  const cur = UI_LANGS[lang];
  return (
    <div style={{position:"relative",zIndex:50}}>
      <button onClick={()=>setOpen(o=>!o)} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"7px 12px",color:"#fff",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
        {cur.flag} {cur.name} ▾
      </button>
      {open && (
        <div style={{position:"absolute",top:46,right:0,background:"#0d0d1f",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:10,zIndex:999,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,width:270,boxShadow:"0 20px 60px rgba(0,0,0,0.8)"}}>
          {Object.entries(UI_LANGS).map(([code,l])=>(
            <button key={code} onClick={()=>{setLang(code);DB.set("eli_lang",code);setOpen(false);}}
              style={{background:lang===code?"rgba(0,255,209,0.12)":"transparent",border:`1px solid ${lang===code?"rgba(0,255,209,0.3)":"transparent"}`,borderRadius:10,padding:"8px 4px",color:lang===code?"#00FFD1":"rgba(255,255,255,0.5)",fontSize:11,fontWeight:700,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <span style={{fontSize:20}}>{l.flag}</span>
              <span style={{fontSize:10}}>{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════ ONBOARDING ════ */
function Onboarding({onDone,t,lang,setLang}) {
  const [step,setStep] = useState(0);
  const [name,setName] = useState("");
  const dir = UI_LANGS[lang]?.dir||"ltr";
  const slides = [
    {icon:"✦",h1:"Eli &",h2:"Dili",sub:t.tagline,cta:t.letsgo,color:"#00FFD1"},
    {icon:"🔥",h1:"Create.",h2:"Go viral.",sub:t.tagline,cta:t.ready,color:"#FF2D78"},
    {icon:"⚡",h1:t.yourname,h2:"",sub:"",isName:true,color:"#FFD600"},
  ];
  const s = slides[step];
  const next = () => {
    if (s.isName) { if(!name.trim()) return; const u={name:name.trim(),premium:false,usageCount:0,joinedAt:Date.now()}; DB.set("eli_user",u); onDone(u); }
    else setStep(p=>p+1);
  };
  return (
    <div dir={dir} style={{width:"100%",maxWidth:430,margin:"0 auto",height:"100dvh",background:"#060610",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 28px",position:"relative",overflow:"hidden"}}>
      <GS/><Mesh c={s.color}/>
      <div style={{position:"absolute",top:20,right:20,zIndex:10}}><LangSwitcher lang={lang} setLang={setLang}/></div>
      <div style={{position:"relative",zIndex:1,width:"100%",textAlign:"center"}} className="fadeUp">
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:52}}>
          {slides.map((_,i)=><div key={i} style={{height:4,width:i===step?32:8,borderRadius:2,background:i===step?s.color:"rgba(255,255,255,0.12)",transition:"all .4s"}}/>)}
        </div>
        <div style={{fontSize:72,marginBottom:24}} className="float">{s.icon}</div>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:48,fontWeight:900,lineHeight:1.05,marginBottom:14}}>
          <span style={{color:"#fff"}}>{s.h1} </span><span style={{color:s.color}}>{s.h2}</span>
        </h1>
        {s.sub && <p style={{color:"rgba(255,255,255,0.4)",fontSize:16,lineHeight:1.7,marginBottom:36}}>{s.sub}</p>}
        {s.isName && <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&next()} placeholder={t.nameHint} autoFocus style={{background:"rgba(255,255,255,0.05)",border:`1.5px solid ${s.color}55`,borderRadius:16,padding:"16px 20px",color:"#fff",fontSize:20,fontWeight:700,outline:"none",width:"100%",textAlign:"center",marginBottom:20,direction:dir}}/>}
        <button onClick={next} style={{background:s.color,border:"none",borderRadius:16,padding:"16px 0",color:"#000",fontWeight:900,fontSize:17,fontFamily:"'Syne',sans-serif",width:"100%",boxShadow:`0 8px 32px ${s.color}55`}}>
          {s.isName?`${t.start}, ${name||"..."} →`:s.cta}
        </button>
        {step>0&&<button onClick={()=>setStep(p=>p-1)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.25)",fontSize:13,marginTop:16}}>← Back</button>}
      </div>
    </div>
  );
}

/* ════ APP SHELL ════ */
export default function App() {
  const [user,setUser]         = useState(null);
  const [screen,setScreen]     = useState("home");
  const [activeTool,setTool]   = useState(null);
  const [accent,setAccent]     = useState("#00FFD1");
  const [lang,setLang]         = useState(()=>DB.get("eli_lang")||"en");
  useEffect(()=>{ const s=DB.get("eli_user"); if(s) setUser(s); },[]);
  const saveUser = u=>{ setUser(u); DB.set("eli_user",u); };
  const t = T[lang]||T.en;
  const dir = UI_LANGS[lang]?.dir||"ltr";
  if (!user) return <Onboarding onDone={setUser} t={t} lang={lang} setLang={setLang}/>;
  const openTool = tool => {
    if (!tool.free&&!user.premium){setScreen("premium");return;}
    if (!user.premium&&(user.usageCount||0)>=5){setScreen("premium");return;}
    setTool(tool); setAccent(tool.color); setScreen("tool");
  };
  return (
    <div dir={dir} style={{width:"100%",maxWidth:430,margin:"0 auto",height:"100dvh",background:"#060610",color:"#fff",fontFamily:"'DM Sans',sans-serif",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
      <GS/><Mesh c={accent}/>
      <div style={{flex:1,overflowY:"auto",position:"relative",zIndex:1}}>
        {screen==="home"    && <HomeScreen    user={user} openTool={openTool} setScreen={setScreen} t={t} lang={lang} setLang={setLang}/>}
        {screen==="tool"    && <ToolScreen    tool={activeTool} user={user} saveUser={saveUser} setScreen={setScreen} t={t} lang={lang}/>}
        {screen==="premium" && <PremiumScreen user={user} saveUser={saveUser} setScreen={setScreen} t={t}/>}
        {screen==="profile" && <ProfileScreen user={user} saveUser={saveUser} setScreen={setScreen} t={t}/>}
      </div>
      {screen!=="tool" && (
        <nav style={{flexShrink:0,background:"rgba(6,6,16,0.97)",backdropFilter:"blur(30px)",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",padding:"12px 0 28px",zIndex:10}}>
          {[{id:"home",e:"✦",l:t.home},{id:"premium",e:"⭐",l:t.pro},{id:"profile",e:"👤",l:t.me}].map(tab=>(
            <button key={tab.id} onClick={()=>setScreen(tab.id)} style={{flex:1,background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:22,filter:screen===tab.id?`drop-shadow(0 0 8px ${accent})`:"none",transition:"filter .3s"}}>{tab.e}</span>
              <span style={{fontSize:10,fontWeight:700,color:screen===tab.id?accent:"rgba(255,255,255,0.25)",transition:"color .3s"}}>{tab.l}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

/* ════ HOME ════ */
function HomeScreen({user,openTool,setScreen,t,lang,setLang}) {
  const used = user.usageCount||0;
  return (
    <div style={{paddingBottom:20}}>
      <div style={{padding:"52px 20px 20px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <div style={{color:"rgba(255,255,255,0.35)",fontSize:13,marginBottom:5}}>{greetStr(t)} ✦</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:900}}>Hey, <span className="shimmer-text">{user.name}</span></div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <LangSwitcher lang={lang} setLang={setLang}/>
            <button onClick={()=>setScreen("profile")} style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#00FFD1,#00B4FF)",border:"none",color:"#000",fontWeight:900,fontSize:16,fontFamily:"'Syne',sans-serif",flexShrink:0}}>
              {user.name[0].toUpperCase()}
            </button>
          </div>
        </div>
        {user.premium?(
          <div style={{background:"rgba(255,214,0,0.08)",border:"1px solid rgba(255,214,0,0.2)",borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>⭐</span>
            <div><div style={{fontWeight:800,color:"#FFD600",fontSize:14}}>{t.proMember}</div><div style={{color:"rgba(255,255,255,0.35)",fontSize:12}}>{t.allUnlocked}</div></div>
          </div>
        ):(
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:"12px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>{t.freeUses}</span>
              <span style={{fontSize:13,fontWeight:800,color:used>=5?"#FF2D78":"#00FFD1"}}>{used}/5</span>
            </div>
            <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
              <div style={{height:"100%",width:`${Math.min(used/5*100,100)}%`,background:used>=5?"#FF2D78":"linear-gradient(90deg,#00FFD1,#00B4FF)",borderRadius:2,transition:"width .5s"}}/>
            </div>
            {used>=5&&<button onClick={()=>setScreen("premium")} style={{marginTop:8,background:"none",border:"none",color:"#FF2D78",fontSize:12,fontWeight:700,padding:0}}>{t.upgrade}</button>}
          </div>
        )}
      </div>
      <div style={{padding:"20px 16px"}}>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",fontWeight:700,letterSpacing:2,marginBottom:14,textTransform:"uppercase"}}>{t.tools}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {TOOLS_DEF.map((tool,i)=>{
            const locked=!tool.free&&!user.premium;
            return (
              <div key={tool.id} onClick={()=>openTool(tool)}
                style={{background:`${tool.color}08`,border:`1px solid ${tool.color}20`,borderRadius:20,padding:"18px 14px",cursor:"pointer",position:"relative",overflow:"hidden",animation:`fadeUp .4s ease ${i*.07}s both`,transition:"all .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.background=`${tool.color}14`;e.currentTarget.style.borderColor=`${tool.color}44`;}}
                onMouseLeave={e=>{e.currentTarget.style.background=`${tool.color}08`;e.currentTarget.style.borderColor=`${tool.color}20`;}}>
                <div style={{position:"absolute",top:-20,right:-20,width:70,height:70,borderRadius:"50%",background:`${tool.color}10`}}/>
                {locked&&<div style={{position:"absolute",top:10,left:12,fontSize:10,background:"rgba(0,0,0,0.6)",borderRadius:6,padding:"2px 8px",color:"rgba(255,255,255,0.5)",fontWeight:700}}>{t.locked}</div>}
                <div style={{fontSize:30,marginBottom:10}}>{tool.emoji}</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,marginBottom:4,color:locked?"rgba(255,255,255,0.4)":"#fff"}}>{tool.label}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{tool.free?t.free:"⭐ "+t.locked}</div>
              </div>
            );
          })}
        </div>
        {!user.premium&&(
          <div onClick={()=>setScreen("premium")} style={{marginTop:14,background:"rgba(0,255,209,0.05)",border:"1px solid rgba(0,255,209,0.12)",borderRadius:20,padding:20,cursor:"pointer",textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:8}}>⭐</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:18,marginBottom:4}}>{t.goPro}</div>
            <div style={{color:"rgba(255,255,255,0.35)",fontSize:13,marginBottom:14}}>{t.goProSub}</div>
            <div style={{background:"linear-gradient(135deg,#00FFD1,#00B4FF)",borderRadius:12,padding:"11px 0",fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:15,color:"#000"}}>{t.onlyEur} ✦</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════ TOOL SCREEN ════ */
function ToolScreen({tool,user,saveUser,setScreen,t,lang}) {
  const [input,setInput]   = useState("");
  const [output,setOutput] = useState("");
  const [loading,setLoading] = useState(false);
  const [capStyle,setCapStyle] = useState(CAP_STYLES[0]);
  const [fromL,setFromL]   = useState("English 🇬🇧");
  const [toL,setToL]       = useState("Danish 🇩🇰");
  const [chatHist,setChatHist] = useState([{role:"assistant",content:t.chatIntro}]);
  const [chatInput,setChatInput] = useState("");
  const endRef = useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[chatHist,output]);
  const isChat = tool.id==="chat";
  const canUse = ()=>{ if(user.premium) return true; if((user.usageCount||0)>=5){setScreen("premium");return false;} return true; };
  const bump = ()=>{ const u={...user,usageCount:(user.usageCount||0)+1}; saveUser(u); };

  const run = async()=>{
    if(!input.trim()||loading||!canUse()) return;
    setLoading(true); setOutput("");
    let sys="";
    if(tool.id==="caption") sys=`You are a viral social media expert. Create 3 ${capStyle.split(" ")[0]} captions for the topic. Include emojis and hashtags. Number them 1. 2. 3.`;
    if(tool.id==="translate") sys=`Translate from ${fromL.split(" ")[0]} to ${toL.split(" ")[0]}. Return ONLY the translation, nothing else.`;
    if(tool.id==="write") sys=`You are an expert writer. Write high-quality, engaging content based on the request. Be creative.`;
    if(tool.id==="bio") sys=`Create 3 punchy social media bios (under 150 chars each). Include emojis. Number them 1. 2. 3.`;
    if(tool.id==="reply") sys=`Generate 3 perfect, natural reply options. Number them 1. 2. 3.`;
    try{ const r=await callAI(sys,input); setOutput(r); bump(); }
    catch{ setOutput("Something went wrong. Please try again!"); }
    setLoading(false);
  };

  const sendChat = async()=>{
    if(!chatInput.trim()||loading||!canUse()) return;
    const msg=chatInput.trim(); setChatInput("");
    setChatHist(h=>[...h,{role:"user",content:msg}]); setLoading(true);
    try{
      const r=await callAI("You are Eli, a fun witty supportive AI bestie for Gen-Z. Speak like a cool friend, use emojis naturally, keep it concise and engaging.",msg,chatHist.slice(-8));
      setChatHist(h=>[...h,{role:"assistant",content:r}]); bump();
    }catch{ setChatHist(h=>[...h,{role:"assistant",content:"Oops! 😅 Try again!"}]); }
    setLoading(false);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100dvh"}}>
      <div style={{padding:"48px 16px 14px",background:"rgba(6,6,16,0.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.06)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setScreen("home")} style={{background:`${tool.color}15`,border:"none",borderRadius:10,width:36,height:36,color:tool.color,fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
          <span style={{fontSize:26}}>{tool.emoji}</span>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17}}>{tool.label}</div>
        </div>
      </div>

      {isChat?(
        <>
          <div style={{flex:1,overflowY:"auto",padding:"16px 14px",display:"flex",flexDirection:"column",gap:12}}>
            {chatHist.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",animation:"fadeUp .25s ease both"}}>
                {m.role==="assistant"&&<div style={{width:30,height:30,borderRadius:"50%",background:`${tool.color}22`,border:`1px solid ${tool.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginRight:8,flexShrink:0}}>✦</div>}
                <div style={{maxWidth:"75%",background:m.role==="user"?`linear-gradient(135deg,${tool.color},${tool.color}88)`:"rgba(255,255,255,0.06)",borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"12px 15px",fontSize:14,lineHeight:1.55,color:m.role==="user"?"#000":"#e0e0e0",border:m.role==="assistant"?"1px solid rgba(255,255,255,0.06)":"none"}}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading&&<div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:`${tool.color}22`,border:`1px solid ${tool.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>✦</div>
              <div style={{background:"rgba(255,255,255,0.06)",borderRadius:"18px 18px 18px 4px",padding:"14px 18px",border:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:5}}>
                {[0,1,2].map(j=><div key={j} style={{width:7,height:7,borderRadius:"50%",background:tool.color,animation:`float 1.2s ease-in-out ${j*.2}s infinite`}}/>)}
              </div>
            </div>}
            <div ref={endRef}/>
          </div>
          <div style={{padding:"10px 12px 28px",background:"rgba(6,6,16,0.97)",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder={t.saySmth} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"13px 16px",color:"#fff",fontSize:14,outline:"none"}}/>
            <button onClick={sendChat} style={{width:44,height:44,borderRadius:14,background:chatInput.trim()?`linear-gradient(135deg,${tool.color},${tool.color}88)`:"rgba(255,255,255,0.06)",border:"none",color:chatInput.trim()?"#000":"#555",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>➤</button>
          </div>
        </>
      ):(
        <div style={{flex:1,overflowY:"auto",padding:"20px 16px"}}>
          {tool.id==="caption"&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",fontWeight:700,letterSpacing:1.5,marginBottom:10,textTransform:"uppercase"}}>{t.style}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {CAP_STYLES.map(s=><button key={s} onClick={()=>setCapStyle(s)} style={{background:capStyle===s?`${tool.color}22`:"rgba(255,255,255,0.04)",border:`1px solid ${capStyle===s?tool.color:"rgba(255,255,255,0.08)"}`,borderRadius:10,padding:"7px 12px",color:capStyle===s?tool.color:"rgba(255,255,255,0.45)",fontSize:12,fontWeight:600}}>{s}</button>)}
              </div>
            </div>
          )}
          {tool.id==="translate"&&(
            <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center"}}>
              <select value={fromL} onChange={e=>setFromL(e.target.value)} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"11px 12px",color:"#fff",fontSize:13,outline:"none"}}>
                {TRANSLATE_LANGS.map(l=><option key={l} style={{background:"#111"}}>{l}</option>)}
              </select>
              <button onClick={()=>{const tmp=fromL;setFromL(toL);setToL(tmp);}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:10,width:36,height:36,color:"#fff",fontSize:16,flexShrink:0}}>⇄</button>
              <select value={toL} onChange={e=>setToL(e.target.value)} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"11px 12px",color:"#fff",fontSize:13,outline:"none"}}>
                {TRANSLATE_LANGS.map(l=><option key={l} style={{background:"#111"}}>{l}</option>)}
              </select>
            </div>
          )}
          <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder={tool.id==="caption"?t.descPhoto:tool.id==="translate"?t.typeText:tool.id==="write"?t.whatWrite:tool.id==="bio"?t.descYou:t.pasteMsg} rows={4} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"14px 16px",color:"#fff",fontSize:15,outline:"none",resize:"none",lineHeight:1.6,marginBottom:14}}/>
          <button onClick={run} disabled={!input.trim()||loading} style={{width:"100%",background:input.trim()&&!loading?`linear-gradient(135deg,${tool.color},${tool.color}88)`:"rgba(255,255,255,0.06)",border:"none",borderRadius:14,padding:"15px 0",color:input.trim()&&!loading?"#000":"#555",fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:16,marginBottom:16,boxShadow:input.trim()&&!loading?`0 8px 24px ${tool.color}44`:"none",transition:"all .3s"}}>
            {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span style={{width:16,height:16,border:"2px solid #000",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 1s linear infinite"}}/> Generating...</span>:`${tool.emoji} ${t.generate}`}
          </button>
          {output&&(
            <div style={{background:`${tool.color}08`,border:`1px solid ${tool.color}22`,borderRadius:18,padding:18}} className="pop">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:12,color:tool.color,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"}}>{t.result}</div>
                <button onClick={()=>navigator.clipboard.writeText(output)} style={{background:`${tool.color}15`,border:"none",borderRadius:8,padding:"5px 12px",color:tool.color,fontSize:12,fontWeight:700}}>{t.copy}</button>
              </div>
              <div style={{color:"#e0e0e0",fontSize:14,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{output}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ════ PREMIUM ════ */
function PremiumScreen({user,saveUser,setScreen,t}) {
  const [loading,setLoading] = useState(false);
  const activate = ()=>{ setLoading(true); setTimeout(()=>{ saveUser({...user,premium:true}); setLoading(false); setScreen("home"); alert("🎉 Welcome to Pro!"); },1500); };
  return (
    <div style={{padding:"52px 20px 40px",minHeight:"100dvh"}}>
      <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:10,width:36,height:36,color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:32}}>‹</button>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontSize:56,marginBottom:16}} className="float">⭐</div>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:36,fontWeight:900,marginBottom:8}}>{t.goPro}</h1>
        <p style={{color:"rgba(255,255,255,0.4)",fontSize:16}}>{t.goProSub}</p>
      </div>
      <div style={{background:"rgba(255,214,0,0.07)",border:"1px solid rgba(255,214,0,0.15)",borderRadius:24,padding:24,marginBottom:16}}>
        {(t.perks||[]).map(p=>(
          <div key={p} style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(255,214,0,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#FFD600",flexShrink:0}}>✓</div>
            <span style={{fontSize:15,color:"rgba(255,255,255,0.8)"}}>{p}</span>
          </div>
        ))}
      </div>
      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:16,marginBottom:16,textAlign:"center"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:40,fontWeight:900,color:"#FFD600"}}>€5</div>
        <div style={{color:"rgba(255,255,255,0.4)",fontSize:14}}>{t.perMonth}</div>
      </div>
      <button onClick={activate} style={{width:"100%",background:"linear-gradient(135deg,#FFD600,#FF8C42)",border:"none",borderRadius:16,padding:"16px 0",color:"#000",fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:18,boxShadow:"0 8px 32px rgba(255,214,0,0.4)"}}>
        {loading?"Activating...":t.startPro}
      </button>
      <p style={{color:"rgba(255,255,255,0.2)",fontSize:12,textAlign:"center",marginTop:14}}>{t.secure}</p>
    </div>
  );
}

/* ════ PROFILE ════ */
function ProfileScreen({user,saveUser,setScreen,t}) {
  const stats=[{label:t.memberSince,val:new Date(user.joinedAt||Date.now()).toLocaleDateString("en-DK",{month:"short",year:"numeric"})},{label:t.aiUses,val:user.usageCount||0},{label:t.plan,val:user.premium?"Pro ⭐":t.free}];
  return (
    <div style={{padding:"52px 20px 40px"}}>
      <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:10,width:36,height:36,color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:32}}>‹</button>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#00FFD1,#00B4FF)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:34,color:"#000",margin:"0 auto 16px"}}>{user.name[0].toUpperCase()}</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:900,marginBottom:4}}>{user.name}</div>
        <div style={{color:"rgba(255,255,255,0.35)",fontSize:14}}>{user.premium?"Pro Member ⭐":t.free}</div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:24}}>
        {stats.map(s=>(
          <div key={s.label} style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"14px 10px",textAlign:"center"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:16,marginBottom:4}}>{s.val}</div>
            <div style={{color:"rgba(255,255,255,0.3)",fontSize:10}}>{s.label}</div>
          </div>
        ))}
      </div>
      {!user.premium&&<button onClick={()=>setScreen("premium")} style={{width:"100%",background:"rgba(0,255,209,0.07)",border:"1px solid rgba(0,255,209,0.15)",borderRadius:16,padding:"15px 0",color:"#00FFD1",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,marginBottom:12}}>⭐ {t.upgradeTo}</button>}
      <button onClick={()=>{DB.set("eli_user",null);window.location.reload();}} style={{width:"100%",background:"rgba(255,45,120,0.07)",border:"1px solid rgba(255,45,120,0.15)",borderRadius:16,padding:"14px 0",color:"#FF2D78",fontWeight:700,fontSize:14}}>{t.signOut}</button>
    </div>
  );
}
