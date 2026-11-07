from odoo import fields, models


class VoreviaConsultation(models.Model):
    _name = "vorevia.consultation"
    _description = "Vorevia Consultation Request"
    _order = "create_date desc"

    name = fields.Char(required=True)
    email = fields.Char(string="Work Email", required=True)
    company = fields.Char()
    phone = fields.Char()
    partner_id = fields.Many2one(
        "res.partner",
        string="Portal Contact",
        index=True,
        ondelete="set null",
        copy=False,
        help="The contact who can view this request in My Account.",
    )
    interest = fields.Selection(
        selection=[
            ("implementation", "ERP implementation"),
            ("customization", "Odoo customization"),
            ("integration", "Integration or migration"),
            ("support", "Training or support"),
            ("unsure", "Not sure yet"),
        ],
        string="Area of Interest",
        required=True,
        default="implementation",
    )
    description = fields.Text(string="Current Situation", required=True)
    timeline = fields.Selection(
        selection=[
            ("asap", "As soon as possible"),
            ("one_month", "Within 1 month"),
            ("one_three_months", "Within 1–3 months"),
            ("three_six_months", "Within 3–6 months"),
            ("exploring", "Just exploring"),
            ("unsure", "Not sure yet"),
        ],
        string="Timeline",
    )
    referral_source = fields.Selection(
        selection=[
            ("google", "Google Search"),
            ("linkedin", "LinkedIn"),
            ("social", "Facebook / Instagram"),
            ("referral", "Friend or colleague"),
            ("client", "Existing client"),
            ("other", "Other"),
        ],
        string="How did you hear about us?",
    )
    state = fields.Selection(
        selection=[
            ("new", "New"),
            ("contacted", "Contacted"),
            ("closed", "Closed"),
        ],
        default="new",
        required=True,
    )

    def website_form_input_filter(self, request, values):
        """Attach website submissions to the current account when available.

        The website form controller creates records with superuser rights, so
        ownership must be captured from the original HTTP request here.
        """
        values = dict(values)
        values.pop("partner_id", None)
        if not request.env.user._is_public():
            values["partner_id"] = request.env.user.partner_id.id
        return values
