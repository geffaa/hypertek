export const packsTermsData = {
  lastUpdated: "19.03.2026",
  intro: `These terms and conditions (the "Packs Terms") govern your access to and use of the "Packs" product offered through the website located at hypertek.io or hypertek100.com, as applicable (the "Website"). The Packs Terms are supplemental to, and should be read together with, the Website's Terms of Service (the "Website TOS"). The Website TOS are incorporated into these Packs Terms, including but not limited to the provisions relating to intellectual property rights, warranties and disclaimers, indemnification, limitations of liability, governing law, and dispute resolution. Capitalised terms used but not defined in these Packs Terms have the meanings assigned to them in the Website TOS. In the event of a conflict between these Packs Terms and the Website TOS, these Packs Terms will control, but solely with respect to your access to and use of the "Packs" product.`,
  sections: [
    {
      id: "packs-s1", title: "1. Definitions",
      content: [
        { type: "bold-p", label: `"NFA or NFC Pack"`, text: `means a Pack that, when opened, reveals a single NFA or NFC representing a digital asset.` },
        { type: "bold-p", label: `"Pack"`, text: `means a digital graphical interface that simulates the opening of a physical pack and reveals a random NFA/NFC when opened. Pack includes both a NFA/NFC Pack and a RWA Pack.` },
        { type: "bold-p", label: `"Payout Price"`, text: `means the fixed price, displayed to you at the time of the reveal of a Pack, at which you may immediately sell the revealed Pack.` },
        { type: "bold-p", label: `"RWA Pack"`, text: `means a Pack that, when opened, reveals a single NFA/NFC representing a right to claim an underlying specific physical real world asset ("RWA").` },
      ],
    },
    {
      id: "packs-s2", title: "2. Packs",
      content: [
        { type: "subsection", title: "Purchase and Opening", content: [
          { type: "p", text: `You may purchase a Pack on the Website using the payment methods supported on the Website. Upon purchase, you will have the ability to open the Pack through a digital graphical user interface, which simulates the visual experience of opening a physical pack. The opening of a Pack is final and irreversible, with each Packs transaction publicly recorded on the relevant blockchain (e.g. Base, Ethereum Layer 2).` },
        ]},
        { type: "subsection", title: "User Election", content: [
          { type: "p", text: `When you open a Pack, a NFA/NFC collection will be revealed to you, and you will make an election to (the "User Election"): (i) immediately sell the NFA/NFC at the Payout Price shown at the time of reveal; or (ii) accept the offer to receive an NFA/NFC from the NFA/NFC collection, in which case your rights, title and ownership of the NFA/NFC will be effected and recorded entirely by smart contracts on the relevant blockchain.` },
          { type: "p", text: `If you fail to make a User Election within the time period specified on the Website (the "Election Window"), then as a default the user will receive the Payout Price.` },
          { type: "p", text: `You acknowledge and agree that all User Elections are final and irrevocable, and no reversals, refunds, or changes will be permitted after the Election Window expires, whether due to user error, technical failure, or any other reason, unless explicitly required by applicable law.` },
        ]},
        { type: "subsection", title: "Additional Terms for RWA Packs", content: [
          { type: "p", text: `You acknowledge and agree that RWA Packs are provided and fulfilled solely by a third party, Collector Crypt Inc. ("Collector Crypt"), and not by us. By purchasing or redeeming an RWA Pack, you agree to be bound by Collector Crypt's terms and conditions, which are available at collectorcrypt.com. We do not control and bear no responsibility or liability for the underlying RWAs, including but not limited to: (i) the authenticity, grading, or condition of any RWA; (ii) the storage or safekeeping of RWAs; (iii) the fulfilment, delivery, or shipping of RWAs; or (iv) any related taxes, duties, or customs compliance. All such matters are exclusively between you and Collector Crypt.` },
        ]},
      ],
    },
  ],
};
