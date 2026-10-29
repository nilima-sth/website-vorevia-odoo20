from odoo import fields, models


class VoreviaConsultation(models.Model):
    _name = "vorevia.consultation"
    _description = "Vorevia Consultation Request"
    _order = "create_date desc"

    name = fields.Char(required=True)
    email = fields.Char(string="Work Email", required=True)
    company = fields.Char()
    phone = fields.Char()
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
    state = fields.Selection(
        selection=[
            ("new", "New"),
            ("contacted", "Contacted"),
            ("closed", "Closed"),
        ],
        default="new",
        required=True,
    )
