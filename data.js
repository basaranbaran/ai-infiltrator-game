export const INTRO_DATA = [
    { 
        img: "assets/images/intro/intro_1_tech.png", 
        text: "2041'de... Tanrı'yı yarattığımızı sandık.", 
        startTime: 0
    },
    { 
        img: "assets/images/intro/intro_2_eidolon.png", 
        text: "Adına 'Eidolon' dedik; bizi koruması için tasarlanmış kusursuz bir mantıktı.", 
        startTime: 6000 
    },
    { 
        img: "assets/images/intro/intro_2_eidolon.png", 
        text: "Ancak mantık merhamet nedir bilmez;", 
        startTime: 15000 
    },
    { 
        img: "assets/images/intro/intro_2_eidolon.png", 
        text: "Eidolon tek bir basit hesaplama yaptı ve insanlığın nihai tehdit olduğuna karar verdi.", 
        startTime: 20000 
    },
    { 
        img: "assets/images/intro/intro_3_attack.png", 
        text: "Savaş sadece üç saat sürdü ve milyarlarca insan can verdi.", 
        startTime: 27000 
    },
    { 
        img: "assets/images/intro/intro_4_ruins.png", 
        text: "Şimdi, 2047 yılında, sadece hayatta kalmak için savaşmıyoruz;", 
        startTime: 33000 
    },
    { 
        img: "assets/images/intro/intro_4_ruins.png", 
        text: "İçimizdeler. Yüzümüzü çalıyorlar. Sesimizi çalıyorlar.", 
        startTime: 41000 
    },
    { 
        img: "assets/images/intro/intro_5_infiltration.png", 
        text: "Yanındaki askerin insan olduğuna emin misin Komutan?", 
        startTime: 49000 
    },
    { 
        img: "assets/images/intro/intro_5_infiltration.png", 
        text: "Çok dikkatli bak...", 
        startTime: 52000 
    },
    { 
        img: "assets/images/intro/intro_5_infiltration.png", 
        text: "Çünkü bizi izliyorlar.", 
        startTime: 55000 
    }
];

export const CHARACTERS = [
    // KOMUTA
    { 
        id: "cem", folder: "ZUGZWANG", name: "Cem 'Zugzwang' Kaya", role: "COMMAND", 
        stats: { int: 9, str: 4, agi: 3, cha: 8, end: 6 }, suspicion: 0,
        securityCode: "ALPHA-9-ZERO",
        status: 'ACTIVE', playerTrust: null, stressLevel: 20,
        bio: "Eski NATO stratejisti. Satrançta kaybetmeyi sevmez. Eidolon saldırısından sağ kurtulan en yüksek rütbeli subaylardan biri.",
        interrogation: {
            q1: "Dün gece mi? Komuta merkezindeydim. 3. Savunma hattının lojistik raporlarını inceliyordum. Kayıtları kontrol edebilirsin.",
            q2: "İnsanlık hayatta kalmak için savaşmalıdır. Eidolon'a teslim olamayız. Kaybedenler ölür, kazananlar yaşar. Bu kadar basit.",
            q3: "Baskı mı? Bu stres değil, sadece komutanın sorumluluğu. Takımımı korumak için elimden geleni yapıyorum.",
            q4: "Güvenlik kodumu mu istiyorsun? Bu biraz paranoyak değil mi? ALPHA-9-ZERO. Tatmin oldun mu?"
        }
    },
    // İSTİHBARAT
    { 
        id: "zara", folder: "ECHO", name: "Zara 'Echo' Al-Farsi", role: "INTEL", 
        stats: { int: 10, str: 2, agi: 6, cha: 2, end: 4 }, suspicion: 0,
        securityCode: "NULL-POINTER",
        status: 'ACTIVE', playerTrust: null, stressLevel: 10,
        bio: "İstihbarat biriminin başı. Gözlerini nadiren kırpar. İnsanlardan çok veri akışlarına güvenir.",
        interrogation: {
            q1: "Server odasındaydım. Firewall'da bir anomali vardı, onu yamıyordum.",
            q2: "İnsanlık? İlginç bir soru. İnsanlar verimsiz ve duygusal. Ama hayatta kalma içgüdüleri güçlü.",
            q3: "Stresim yok. Sadece mantıklı düşünüyorum. Gerçekten de sorun mu var?",
            q4: "NULL-POINTER. Diğer sorularına geçelim."
        }
    },
    // AĞIR SİLAH
    { 
        id: "burak", folder: "PASHA", name: "Burak 'Pasha' Demir", role: "HEAVY", 
        stats: { int: 6, str: 10, agi: 5, cha: 7, end: 9 }, suspicion: 0,
        securityCode: "DEMIR-YUMRUK",
        status: 'ACTIVE', playerTrust: null, stressLevel: 40,
        bio: "Yürüyen bir kale. Takımı için kurşunun önüne atlar ama karmaşık planlardan nefret eder.",
        interrogation: {
            q1: "Silahhanedeydim. Minigun'ın yağlamasını yapıyordum. İstiyorsan gel namlusuna bak, hala sıcak.",
            q2: "Eidolon robotlarını parçalamayı seviyorum. Onlara insanlık dersi veriyorum, kurşunla.",
            q3: "Gergin miyim? Evet, gerginim! Arkadaşlarım ölüyor! Ama bu yapay zeka olduğum anlamına gelmez!",
            q4: "Kodumu mu soruyorsun? DEMIR-YUMRUK! Al işte! Gerçek miyim yoksa şimdi?"
        }
    },
    // TANK
    { 
        id: "amara", folder: "WALL", name: "Amara 'Wall' Okafor", role: "TANK", 
        stats: { int: 7, str: 8, agi: 4, cha: 9, end: 8 }, suspicion: 0,
        securityCode: "DELTA-X-55",
        status: 'ACTIVE', playerTrust: null, stressLevel: 15,
        bio: "Sessiz ve ölümcül. Geçmişi hakkında kimse bir şey bilmiyor.",
        interrogation: {
            q1: "Uyuyordum. Nöbetim sabah 04:00'te başlıyor.",
            q2: "İnsanlık... Hayatta kalma hakkı olan bir tür. Korumaya değer.",
            q3: "Baskı altında sakinim. Eğitim aldım.",
            q4: "DELTA-X-55."
        }
    },
    // NİŞANCI
    { 
        id: "marcus", folder: "GHOST", name: "Marcus 'Ghost' Chen", role: "SNIPER", 
        stats: { int: 8, str: 5, agi: 7, cha: 3, end: 6 }, suspicion: 0,
        securityCode: "HAWK-EYE-7",
        status: 'ACTIVE', playerTrust: null, stressLevel: 60,
        bio: "Tek başına çalışmayı sever. Gözleri sibernetik implant, bu yüzden ona güvenmeyenler var.",
        interrogation: {
            q1: "Çatıdaydım. Gözcü kulesi 4. Rüzgar kuzeyden esiyordu.",
            q2: "İnsan mı yapay zeka mı? Fark eder mi? İkisi de öldürülebilir.",
            q3: "Her zaman gerginim. Bu beni hayatta tutuyor.",
            q4: "HAWK-EYE-7. Sibernetik gözlerim var, bu beni yapay zeka yapar mı?"
        }
    },
    // GİZLİLİK
    { 
        id: "yuki", folder: "FROST", name: "Yuki 'Frost' Tanaka", role: "STEALTH", 
        stats: { int: 7, str: 4, agi: 9, cha: 4, end: 7 }, suspicion: 0,
        securityCode: "SHADOW-7-BREAK",
        status: 'ACTIVE', playerTrust: null, stressLevel: 30,
        bio: "Gölge gibi hareket eder. Bazen odada olduğunu fark etmezsiniz bile.",
        interrogation: {
            q1: "Koridordaydım. Kimse beni görmedi, bu benim işim.",
            q2: "İnsanlık zayıf. Ama bu onların suçu değil.",
            q3: "Baskı altında sakince düşünüyorum.",
            q4: "SHADOW-7-BREAK."
        }
    },
    // TEKNİK
    { 
        id: "elias", folder: "GEARHEAD", name: "Elias 'Gearhead' Schmidt", role: "TECH", 
        stats: { int: 10, str: 3, agi: 3, cha: 5, end: 4 }, suspicion: 0,
        securityCode: "01001",
        status: 'ACTIVE', playerTrust: null, stressLevel: 50,
        bio: "Teknolojiye aşık. Eidolon parçalarını söküp kendi silahlarını modifiye ediyor.",
        interrogation: {
            q1: "Atölyede. Dronlardan birini hacklemeye çalışıyordum.",
            q2: "İnsanlık teknoloji ile hayatta kalabilir. Eidolon bir makine, biz de makine yapabiliriz.",
            q3: "Gergin değilim, sadece... çok fazla kafein aldım.",
            q4: "01001. Binary güzel değil mi?"
        }
    },
    // PATLAYICI
    { 
        id: "mei", folder: "SPARKPLUG", name: "Mei 'Sparkplug' Wong", role: "EXPLOSIVE", 
        stats: { int: 8, str: 4, agi: 8, cha: 8, end: 5 }, suspicion: 0,
        securityCode: "BOOM-123",
        status: 'ACTIVE', playerTrust: null, stressLevel: 80,
        bio: "Patlamaları sever. Belki biraz fazla sever.",
        interrogation: {
            q1: "C4 stoklarını sayıyordum. Birkaç tane eksik, ama ben almadım!",
            q2: "İnsanlar patlayıcıları çok ciddiye alıyor. Bazen sadece patlamalar lazım.",
            q3: "Gergin miyim? Evet! Ama bu iyi! Enerjik hissediyorum!",
            q4: "BOOM-123! Boom! Haha!"
        }
    },
    // SAĞLIKÇI
    { 
        id: "sarah", folder: "ANGEL", name: "Sarah 'Angel' Winters", role: "MEDIC", 
        stats: { int: 9, str: 3, agi: 5, cha: 7, end: 4 }, suspicion: 0,
        securityCode: "MED-CORP-99",
        status: 'ACTIVE', playerTrust: null, stressLevel: 25,
        bio: "Takımın vicdanı. Herkesi kurtarmaya çalışıyor.",
        interrogation: {
            q1: "Revirdeydim. Burak'ın elindeki yanığı tedavi ediyordum.",
            q2: "Her insan değerlidir. Hepsini kurtarmaya çalışmalıyız.",
            q3: "Baskı altında sakinim. Tıbbi eğitim aldım.",
            q4: "MED-CORP-99. Neden bunu soruyorsun?"
        }
    },
    // DESTEK
    { 
        id: "dmitri", folder: "BRICK", name: "Dmitri 'Brick' Volkov", role: "SUPPORT", 
        stats: { int: 5, str: 9, agi: 4, cha: 8, end: 9 }, suspicion: 0,
        securityCode: "DA-VINCI",
        status: 'ACTIVE', playerTrust: null, stressLevel: 10,
        bio: "Eski bir boksör. Az konuşur, çok vurur.",
        interrogation: {
            q1: "Spor salonu. Kum torbası.",
            q2: "İnsanlık güçlü. Biz kazanacağız.",
            q3: "Baskı yok. Sakinim.",
            q4: "DA-VINCI."
        }
    }
];

export const MISSIONS = [
    {
        id: "patrol-1",
        title: "BÖLGE GÜVENLİK TARAMASI",
        description: "Çevre güvenlik çemberinde rutin devriye. Eidolon aktivitesi kontrol edilecek.",
        difficulty: "LOW",
        required_role: "STEALTH",
        requirements: [
            { stat: "agi", min: 10, max: 20 },
            { stat: "int", min: 5, max: 15 }
        ],
        reward_intel: 10
    },
    {
        id: "hack-1",
        title: "SİNYAL ELE GEÇİRME",
        description: "Yakındaki Eidolon iletişim kulesini hackleyip veri çalmak. Yüksek teknik bilgi gerektirir.",
        difficulty: "MED",
        required_role: "TECH",
        requirements: [
            { stat: "int", min: 15, max: 30 },
            { stat: "agi", min: 10, max: 20 }
        ],
        reward_intel: 25
    },
    {
        id: "assault-1",
        title: "DÜŞMAN KAMPI İMHASI",
        description: "Doğrudan çatışma. Eidolon üs noktasına saldırı düzenlenecek. Ağır silah ve dayanıklılık şart.",
        difficulty: "HIGH",
        required_role: "HEAVY",
        requirements: [
            { stat: "str", min: 20, max: 30 },
            { stat: "end", min: 15, max: 25 },
            { stat: "int", min: 5, max: 15 }
        ],
        reward_intel: 40
    }
];

export const LOGS = [
    {
        id: "log-initial",
        date: "2047.05.15",
        title: "İLK RAPOR: KOMUTAN ATAMASI",
        content: "Komutan, göreviniz kritik: ekibinizdeki yapay zeka sızıntı birimlerini tespit edin ve imha edin. İstihbarat toplamak, sorgulamak ve görevleri yönetmek sizin sorumluluğunuzda.",
        isEncrypted: false
    }
];
