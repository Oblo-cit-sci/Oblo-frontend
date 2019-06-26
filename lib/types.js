export default [
  [
    "valuelist",
    {
      "content": {
        "activities": {},
        "aspects": [
          {
            "attr": {
              "max": 40
            },
            "description": "the values for a select",
            "items": {
              "attr": 80,
              "type": "str"
            },
            "name": "values",
            "type": "list"
          }
        ],
        "meta": {
          "context": "global"
        }
      },
      "description": "String-values for surveys",
      "language": "English",
      "parent_type": 0,
      "slug": "valuelist",
      "title": "Valuelist",
      "version": 0
    }
  ],
  [
    "basic_observation",
    {
      "content": {
        "activities": {},
        "aspects": [
          {
            "attr": {
              "max": 30
            },
            "name": "title",
            "type": "str"
          },
          {
            "attr": {
              "max": 1200
            },
            "description": "describe your observation",
            "name": "description",
            "type": "str"
          },
          {
            "attr": {},
            "description": "When was the observation made",
            "name": "observation time",
            "type": "date"
          },
          {
            "attr": {},
            "description": "specify the location of the observation",
            "name": "location",
            "options": [
              {
                "attr": {
                  "select": "position"
                },
                "name": "from device",
                "type": "gps"
              },
              {
                "attr": {
                  "select": "map"
                },
                "name": "from map",
                "type": "gps"
              }
            ],
            "type": "options",
            "view_type": {
              "attr": {},
              "components": [
                {
                  "attr": {
                    "max": 180,
                    "min": -180
                  },
                  "name": "longitude",
                  "type": "float"
                },
                {
                  "attr": {
                    "max": 90,
                    "min": -90
                  },
                  "name": "latitude",
                  "type": "float"
                }
              ],
              "description": "GPS coordinates. error included",
              "name": "coordinates",
              "type": "composite"
            }
          },
          {
            "attr": {},
            "description": "local indicator of climate change impact",
            "items": "*liccis",
            "name": "Licci",
            "type": "tree"
          }
        ],
        "meta": {
          "context": "global"
        }
      },
      "description": "A basic observation of a LICCI",
      "language": "English",
      "parent_type": 0,
      "slug": "basic_observation",
      "title": "Basic observation",
      "version": 0
    }
  ],
  [
    "timeline",
    {
      "content": {
        "activities": {},
        "aspects": [
          {
            "attr": {},
            "description": "Events on the timeline",
            "items": {
              "attr": {},
              "components": [
                {
                  "attr": {
                    "max": 50
                  },
                  "name": "title",
                  "type": "str"
                },
                {
                  "attr": {
                    "max": 800
                  },
                  "name": "description",
                  "type": "str"
                },
                {
                  "attr": {},
                  "items": [
                    "socio-cultural",
                    "climatic"
                  ],
                  "name": "event type",
                  "type": "select"
                },
                {
                  "attr": {},
                  "name": "year",
                  "type": "int"
                },
                {
                  "attr": {},
                  "name": "error",
                  "type": "int"
                }
              ],
              "type": "composite"
            },
            "name": "events",
            "type": "list"
          }
        ],
        "meta": {
          "context": "global"
        }
      },
      "description": "Timeline of socio-cultural and climatic event on the site",
      "language": "English",
      "parent_type": 0,
      "slug": "timeline",
      "title": "Timeline",
      "version": 0
    }
  ],
  [
    "site",
    {
      "content": {
        "activities": {
          "send": [
            {
              "dtype": "actor",
              "object": "#Assigned investigator",
              "target": "$owners",
              "type": "Add"
            },
            {
              "dtype": "actor",
              "object": "@self",
              "target": "$reviewers",
              "type": "Add"
            }
          ]
        },
        "aspects": [
          {
            "attr": {
              "max": 40
            },
            "name": "name",
            "type": "str"
          },
          {
            "attr": {
              "min": 1
            },
            "name": "id",
            "type": "int"
          },
          {
            "attr": {
              "max": 1200
            },
            "name": "description",
            "type": "str"
          },
          {
            "attr": {
              "max": 40
            },
            "description": "Name of the local currency",
            "name": "Local currency",
            "type": "str"
          },
          {
            "attr": {},
            "description": "conversion from local currency to dollar(1$ = X)",
            "name": "Conversion factor",
            "type": "float"
          },
          {
            "attr": {
              "max": 40
            },
            "description": "Name of the closest administrative center, reference to the village",
            "name": "City",
            "type": "str"
          },
          {
            "attr": {
              "max": 40
            },
            "description": "Name of the closest market town, where people go sell their products",
            "name": "Town",
            "type": "str"
          },
          {
            "attr": {
              "itemname": "item",
              "number": 10
            },
            "descriptions": "",
            "items": {
              "attr": {},
              "components": [
                {
                  "attr": {
                    "max": 40
                  },
                  "description": "",
                  "name": "name",
                  "type": "str"
                },
                {
                  "attr": {},
                  "description": "",
                  "name": "price",
                  "type": "int"
                }
              ],
              "type": "composite"
            },
            "name": "Itemprices",
            "type": "list"
          },
          {
            "attr": {
              "itemname": "village",
              "min": 1
            },
            "description": "The visited villages of this site",
            "items": "$village",
            "name": "Villages",
            "type": "list"
          },
          {
            "attr": {},
            "description": "Liccis and their drivers",
            "items": {
              "attr": {},
              "components": [
                {
                  "attr": {},
                  "description": "",
                  "items": "*liccis",
                  "name": "licci",
                  "type": "tree"
                },
                {
                  "attr": {
                    "max": 2000
                  },
                  "description": "",
                  "name": "description",
                  "type": "str"
                },
                {
                  "attr": {},
                  "description": "Did the licci descrease/diminish/happen OR earlier/increase/intesify/happen later",
                  "items": [
                    "decrease",
                    "increase"
                  ],
                  "name": "direction of change",
                  "type": "select"
                },
                {
                  "attr": {},
                  "description": "What drove/caused the LICCI",
                  "items": {
                    "attr": {},
                    "components": [
                      {
                        "attr": {
                          "alternative": {
                            "attr": {
                              "max": 40
                            },
                            "description": "a driver that is not climate related",
                            "name": "alternative driver",
                            "type": "str"
                          }
                        },
                        "items": "*liccis",
                        "name": "driver",
                        "type": "tree"
                      },
                      {
                        "attr": {},
                        "name": "description",
                        "type": "str"
                      }
                    ],
                    "name": "driver",
                    "type": "composite"
                  },
                  "name": "Drivers",
                  "type": "list"
                },
                {
                  "attr": {},
                  "description": "",
                  "items": [
                    "disagreed",
                    "disagreed after debate",
                    "agreed after debate",
                    "fully agreed"
                  ],
                  "name": "Level of agreement",
                  "type": "select"
                }
              ],
              "name": "a licci and its drivers",
              "type": "composite"
            },
            "name": "liccis and drivers",
            "type": "list"
          }
        ],
        "meta": {
          "context": "global",
          "download": true,
          "has_license": false,
          "has_privacy": false
        }
      },
      "description": "a site of licci research",
      "language": "English",
      "parent_type": 0,
      "slug": "site",
      "title": "Site",
      "version": 0
    }
  ],
  [
    "ao_site",
    {
      "content": {
        "activities": {},
        "aspects": [
          {
            "attr": {
              "max": 40
            },
            "name": "title",
            "type": "str"
          },
          {
            "attr": {},
            "description": [
              "Description of the site.",
              "Should include something like name of group and whever you consider important."
            ],
            "name": "description",
            "type": "str"
          },
          {
            "attr": {},
            "description": "a location, which can have multiple liccis reported",
            "items": {
              "attr": {},
              "components": [
                {
                  "attr": {
                    "max": 40,
                    "min": 8
                  },
                  "description": "The title of the site",
                  "name": "title",
                  "required": true,
                  "type": "str"
                },
                {
                  "attr": {
                    "max": 1200
                  },
                  "description": "description of the aspect",
                  "name": "description",
                  "type": "str"
                },
                {
                  "attr": {
                    "select": "map"
                  },
                  "description": "specify the location of the observation",
                  "name": "location",
                  "type": "gps"
                },
                {
                  "attr": {},
                  "items": "*liccis_flat",
                  "name": "liccis",
                  "type": "multiselect"
                }
              ],
              "type": "composite"
            },
            "name": "locations",
            "type": "list"
          }
        ],
        "meta": {
          "context": "article_observation"
        }
      },
      "description": "",
      "language": "English",
      "parent_type": 0,
      "slug": "ao_site",
      "title": "Article Observation Site",
      "version": 0
    }
  ],
  [
    "article_observation",
    {
      "content": {
        "activities": {},
        "aspects": [
          {
            "attr": {
              "max": 30
            },
            "description": "Title of the article",
            "name": "title",
            "type": "str"
          },
          {
            "attr": 1200,
            "name": "Abstract",
            "type": "str"
          },
          {
            "attr": {
              "create": 1
            },
            "description": [
              "The authors of the title",
              "Full name"
            ],
            "items": {
              "attr": {
                "max": 20,
                "placeholder": "Peter Parker"
              },
              "name": "Author",
              "type": "str"
            },
            "name": "Authors",
            "type": "list"
          },
          {
            "attr": {},
            "description": "Year of publication",
            "name": "Year",
            "type": "int"
          },
          {
            "attr": {
              "max": 60
            },
            "description": "DOI of the paper",
            "name": "doi",
            "type": "str"
          },
          {
            "attr": {
              "select": "check"
            },
            "description": [
              "Is the article available under an open access license.",
              "It's fucking too late, to get fucked over by greedy companies"
            ],
            "items": [
              "no",
              "yes"
            ],
            "name": "is open access",
            "type": "select"
          },
          {
            "attr": {},
            "components": [
              {
                "attr": {
                  "max": 40
                },
                "description": "title of the source (or just title of the paper again)",
                "name": "title",
                "type": "str"
              },
              {
                "attr": {
                  "max": 60
                },
                "description": "url to the source",
                "name": "url",
                "type": "str"
              }
            ],
            "description": "The url with a name for the paper",
            "name": "Source",
            "type": "composite",
            "view_type": "url"
          },
          {
            "attr": {},
            "description": [
              "A site, is an in the paper distinctive regio, with its own group. which can have multiple locations and liccis.",
              "A paper can do comparative analysis between multiple groups and therefor have multiple sites."
            ],
            "items": "$ao_site",
            "name": "Sites",
            "type": "list"
          }
        ],
        "meta": {
          "context": "global",
          "review": "always"
        }
      },
      "description": "LICCI analysis of academic article",
      "language": "English",
      "parent_type": 0,
      "slug": "article_observation",
      "title": "Article Observation",
      "version": 0
    }
  ],
  [
    "village",
    {
      "content": {
        "activities": {},
        "aspects": [
          {
            "attr": {
              "max": 30
            },
            "name": "name",
            "type": "str"
          },
          {
            "attr": {
              "max": 1200
            },
            "name": "description",
            "type": "str"
          },
          {
            "attr": {
              "min": 0,
              "suffix": "households"
            },
            "description": "Simple census. Number of households",
            "name": "census",
            "type": "int"
          },
          {
            "attr": {
              "itemname": "survey"
            },
            "description": "List of all surveys",
            "items": "$survey",
            "name": "Surveys",
            "type": "list"
          }
        ],
        "meta": {
          "context": "site",
          "privacy": "PRIVATE_LOCAL"
        }
      },
      "description": "a village",
      "language": "English",
      "parent_type": 0,
      "slug": "village",
      "title": "Village",
      "version": 0
    }
  ],
  [
    "survey_extra_tests",
    {
      "content": {
        "activities": {},
        "aspects": [
          {
            "attr": {
              "create": 1
            },
            "items": {
              "attr": {},
              "components": [
                {
                  "attr": {
                    "min": 0
                  },
                  "description": "number of male household heads",
                  "name": "male HH heads",
                  "type": "int"
                },
                {
                  "attr": {
                    "min": 0
                  },
                  "description": "number of female household heads",
                  "name": "female HH heads",
                  "type": "int"
                }
              ],
              "name": "House",
              "type": "composite"
            },
            "name": "Household composition",
            "type": "list"
          }
        ],
        "meta": {
          "context": "global"
        }
      },
      "description": "",
      "language": "English",
      "parent_type": 0,
      "slug": "survey_extra_tests",
      "title": "Survey extra tests",
      "version": 0
    }
  ],
  [
    "survey",
    {
      "content": {
        "activities": {},
        "aspects": [
          {
            "attr": {
              "page": 0
            },
            "description": "Village id",
            "name": "Village id",
            "type": "int"
          },
          {
            "attr": {
              "page": 0
            },
            "description": "Household id",
            "name": "Household id",
            "type": "int"
          },
          {
            "attr": {
              "page": 0
            },
            "description": "Were you able to conduct a one-to-one interview or other people have participated?",
            "items": [
              "alone",
              "other people from the household",
              "multiple people participated"
            ],
            "name": "interview context",
            "type": "select"
          },
          {
            "attr": {
              "page": 0
            },
            "description": "Did you manage to randomly select the respondent for the individual questions?",
            "items": [
              "yes",
              "no"
            ],
            "name": "randomization",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 1
            },
            "description": "Does the person has/have had a position of authority/respect in this village?",
            "items": [
              "yes",
              "no"
            ],
            "name": "is authority",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 1
            },
            "description": "How old are you?",
            "name": "age",
            "type": "int"
          },
          {
            "attr": {
              "page": 1
            },
            "description": "How was the age estimated",
            "items": [
              "the person knows exactly the age",
              "age was estimated"
            ],
            "name": "age accuracy",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 2
            },
            "description": "Where did you grow up?",
            "items": [
              "in this area",
              "nearby area with similar environmental characteristics",
              "markedly different area"
            ],
            "name": "grow up place",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 2
            },
            "description": "Where did your mother grow up?",
            "items": [
              "in this area",
              "nearby area with similar environmental characteristics",
              "markedly different area"
            ],
            "name": "grow up place mother",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 2
            },
            "description": "Where did your father grow up?",
            "items": [
              "in this area",
              "nearby area with similar environmental characteristics",
              "markedly different area"
            ],
            "name": "grow up place father",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 2
            },
            "description": "Do your parents now live in this village?",
            "items": [
              "none of them",
              "one of them",
              "both of them"
            ],
            "name": "parents in village",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 2
            },
            "description": "How many of your grandparents  grew up in this area?",
            "items": [
              "none of them",
              "one of them",
              "two of them",
              "three of them",
              "all of them"
            ],
            "name": "grow up place grandparents",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 3
            },
            "description": "Over the last year, how often did you travel to the market town",
            "items": [
              "never",
              "a few times per year",
              "once per month",
              "once per week",
              "several times per week"
            ],
            "name": "travel market town",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 3
            },
            "description": "Over the last year, how often did you travel to the administrative city",
            "items": [
              "never",
              "a few times per year",
              "once per month",
              "once per week",
              "several times per week"
            ],
            "name": "travel administrative city",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 4
            },
            "description": "Do you speak the national language?",
            "items": [
              "no",
              "a little",
              "fluent"
            ],
            "name": "language national",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 4
            },
            "description": "Do you speak any other language?",
            "items": [
              "no",
              "a little",
              "fluent"
            ],
            "name": "language other",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 4
            },
            "description": "What is the maximum school grade that you have completed?",
            "items": [
              "primary school",
              "middle school",
              "high school",
              "beyond high school"
            ],
            "name": "school grade",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 6
            },
            "description": "Is this house yours, is it rented, or are you borrowing it from someone?",
            "items": [
              "own house",
              "rented house",
              "borrowed house"
            ],
            "name": "houses ownership",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 6
            },
            "description": "What is the material of the roof of your house?",
            "items": [
              "nothing",
              "mud/soil",
              "stones",
              "wood",
              "metal",
              "bricks/concrete/tiles",
              "reeds/straw/grass/fibers/thatch",
              "other (specify)"
            ],
            "name": "houses material roof",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 6
            },
            "description": "What is the material of the walls of your house?",
            "items": [
              "nothing",
              "mud/soil",
              "stones",
              "wood",
              "metal",
              "bricks/concrete/tiles",
              "reeds/straw/grass/fibers/thatch",
              "other (specify)"
            ],
            "name": "houses material walls",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 6
            },
            "description": "What is the material of the floor of your house?",
            "items": [
              "nothing",
              "mud/soil",
              "stones",
              "wood",
              "metal",
              "bricks/concrete/tiles",
              "reeds/straw/grass/fibers/thatch",
              "other (specify)"
            ],
            "name": "houses material floor",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 6
            },
            "description": "How many of [item1] does you or anyone in your household own?",
            "name": "assets item1",
            "type": "int"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 6
            },
            "description": "How many of [item2] does you or anyone in your household own?",
            "name": "assets item2",
            "type": "int"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 6
            },
            "description": "How many of [item3] does you or anyone in your household own?",
            "name": "assets item3",
            "type": "int"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 6
            },
            "description": "How many of [item4] does you or anyone in your household own?",
            "name": "assets item4",
            "type": "int"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 6
            },
            "description": "How many of [item5] does you or anyone in your household own?",
            "name": "assets item5",
            "type": "int"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 6
            },
            "description": "How many of [item6] does you or anyone in your household own?",
            "name": "assets item6",
            "type": "int"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 6
            },
            "description": "How many of [item7] does you or anyone in your household own?",
            "name": "assets item7",
            "type": "int"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 6
            },
            "description": "How many of [item8] does you or anyone in your household own?",
            "name": "assets item8",
            "type": "int"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 6
            },
            "description": "How many of [item9] does you or anyone in your household own?",
            "name": "assets item9",
            "type": "int"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 6
            },
            "description": "How many of [item10] does you or anyone in your household own?",
            "name": "assets item10",
            "type": "int"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 7
            },
            "description": "How often do you listen to the radio?",
            "items": [
              "almost never",
              "monthly",
              "weekly",
              "almost daily"
            ],
            "name": "radio frequency",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 7
            },
            "description": "How often do you use a telephone?",
            "items": [
              "almost never",
              "monthly",
              "weekly",
              "almost daily"
            ],
            "name": "telephone frequency",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 7
            },
            "description": "How often do you use internet?",
            "items": [
              "almost never",
              "monthly",
              "weekly",
              "almost daily"
            ],
            "name": "internet frequency",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 8
            },
            "description": "Do you or anyone in your household engage in collective work activities?",
            "items": [
              "no",
              "rarely",
              "sometimes",
              "often"
            ],
            "name": "collective activities",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 8
            },
            "description": "In the last year, has anyone in the household received any support from the government (financial assistance, material help)?",
            "items": [
              "yes",
              "no"
            ],
            "name": "government support",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 8
            },
            "description": "In the last year, has anyone in the household received any help from development organizations (NGOs, church)?",
            "items": [
              "ngo support",
              "yes",
              "no"
            ],
            "name": "ngo support",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 8
            },
            "description": "In case of an emergency/necessity, are there people you could you borrow money from [substantial amount]?",
            "items": [
              "emergency cash",
              "yes",
              "no"
            ],
            "name": "emergency cash",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 9
            },
            "description": "Who works in these activities?",
            "items": [
              "one or few household members",
              "most or all household members",
              "unpaid collective work",
              "paid workers"
            ],
            "name": "livelihood activities labor",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 9
            },
            "description": "Who owns the area where these activities are done?",
            "items": [
              "own land",
              "rented land",
              "borrowed land",
              "common land",
              "state land"
            ],
            "name": "livelihood activities ownership",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 9
            },
            "description": "What does your household do with the products of these activities?",
            "items": [
              "mostly self consumption",
              "more self consumption than sale",
              "equal self consumption and sale",
              "more sale than self consumption",
              "mostly sale"
            ],
            "name": "livelihood activities goal",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 9
            },
            "description": "How many cultivation plots does your household have/ had this year?",
            "name": "cultivation number of plots",
            "type": "int"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 9
            },
            "description": "What is the approximate size of the plot?",
            "name": "cultivation plot size",
            "type": "int"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 9
            },
            "description": "What kind of livestock does your household own?",
            "items": [
              "cows",
              "goats",
              "sheep",
              "horses",
              "camels",
              "donkeys",
              "other (specify)"
            ],
            "name": "livestock types",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 9
            },
            "description": "How many livestock does your household you own?",
            "name": "livestock quantity",
            "type": "int"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 10
            },
            "description": "Which of these statements best describes your household water availability in the last year?",
            "items": [
              "we always have enough water and it is good",
              "we always have enough water",
              "but it is not always good",
              "sometimes we do not have enough water",
              "often we do not have enough water"
            ],
            "name": "water security",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 11
            },
            "description": "Does your household have any monetary savings?",
            "items": [
              "yes",
              "no"
            ],
            "name": "monetary savings",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 11
            },
            "description": "If your household need to access your monetary savings immediately, could you access it right away?´",
            "items": [
              "yes",
              "no"
            ],
            "name": "monetary savings access",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 11
            },
            "description": "Does your household owe money?",
            "items": [
              "I do not owe money",
              "I owe some money",
              "I owe a lot of money"
            ],
            "name": "monetary debts",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 13
            },
            "description": "the temperatures in the [name of the coldest season of the year] are..",
            "items": [
              "the same",
              "warmer",
              "colder"
            ],
            "name": "temp coldest season",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 13
            },
            "description": "the temperatures in the [name of the hottest season of the year] are…",
            "items": [
              "the same",
              "warmer",
              "colder"
            ],
            "name": "temp hottest season",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 13
            },
            "description": "the total amount of rain throughout the year is…",
            "items": [
              "the same",
              "lower",
              "higher"
            ],
            "name": "rain general",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 13
            },
            "description": "the amount of rain during the [name of the longest/more intense rainy season] is…",
            "items": [
              "the same",
              "lower",
              "higher"
            ],
            "name": "rain rainy season",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 13
            },
            "description": "the amount of rain during the [name of the longest/more intense dry season] is…",
            "items": [
              "the same",
              "lower",
              "higher"
            ],
            "name": "rain dry season",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 13
            },
            "description": "the extreme [rain-related] floods are happening…",
            "items": [
              "the same",
              "less frequently",
              "more frequently",
              "more intensively",
              "less intensively"
            ],
            "name": "extreme floods",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 13
            },
            "description": "the extreme [rain-related] droughts are happening…",
            "items": [
              "the same",
              "less frequently",
              "more frequently",
              "more intensively",
              "less intensively"
            ],
            "name": "extreme droughts",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 13
            },
            "description": "the onset of the [name of the longest/more intense rainy season] is happening…",
            "items": [
              "the same",
              "earlier",
              "later"
            ],
            "name": "rainy season onset",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 13
            },
            "description": "the duration of the [name of the longest/more intense rainy season] is…",
            "items": [
              "the same",
              "shorter",
              "longer"
            ],
            "name": "rainy season duration",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 13
            },
            "description": "the duration of the [name of the longest/more intense dry season] is…",
            "items": [
              "the same",
              "shorter",
              "longer"
            ],
            "name": "dry season duration",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 15
            },
            "description": "Could you tell me the name of the 3 [wild] birds that are more abundant around your village nowadays?",
            "items": "str",
            "name": "baselines birds present",
            "type": "list"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 15
            },
            "description": "Could you tell me the name of 3 [wild] animals around this area that disappeared before you were born?",
            "items": "str",
            "name": "baselines animals disappeared",
            "type": "list"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 16
            },
            "description": "Why have you stopped / reduced the cultivation of this crop?",
            "items": [
              "climatic changes",
              "changes in market and/or value chain",
              "changes in availability/access to inputs",
              "changes in biophysical conditions (other than climate)",
              "changes in food habits",
              "societal changes",
              "other (specify)"
            ],
            "name": "crop species abandon reason",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 16
            },
            "description": "Could you tell me the name of 3 crop species that you did not cultivated before [as a young adult] and that now you have introduced or increased its cultivation?",
            "items": "str",
            "name": "crop species adoption",
            "type": "list"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 16
            },
            "description": "Why have you introduced / increased the cultivation of this crop?",
            "items": [
              "climatic changes",
              "changes in market and/or value chain",
              "changes in availability/access to inputs",
              "changes in biophysical conditions (other than climate)",
              "changes in food habits",
              "societal changes",
              "other (specify)"
            ],
            "name": "crop species adoption reason",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 16
            },
            "description": "Could you tell me the name of 3 landraces of the [main staple crop] that you cultivated before [as a young adult] and that you do not cultivate anymore (or cultivate to a lesser extent)?",
            "items": "str",
            "name": "crop landraces abandon",
            "type": "list"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 16
            },
            "description": "Why have you stopped / reduced the cultivation of this landrace?",
            "items": [
              "climatic changes",
              "changes in market and/or value chain",
              "changes in availability/access to inputs",
              "changes in biophysical conditions (other than climate)",
              "changes in food habits",
              "societal changes",
              "other (specify)"
            ],
            "name": "crop landraces abandon reason",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 16
            },
            "description": "Could you tell me the name of 3 landraces of [the main staple crop]  that you did not cultivated before [as a young adult] and that now you have introduced or increased its cultivation?",
            "items": "str",
            "name": "crop landraces adoption",
            "type": "list"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 16
            },
            "description": "Why have you introduced / increased the cultivation of this landrace?",
            "items": [
              "climatic changes",
              "changes in market and/or value chain",
              "changes in availability/access to inputs",
              "changes in biophysical conditions (other than climate)",
              "changes in food habits",
              "societal changes",
              "other (specify)"
            ],
            "name": "crop landraces adoption reason",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 16
            },
            "description": "What do you think is the best option / strategy to feed your family despite the changes taking place in this area?",
            "items": [
              "focus cultivation on one or a few crops",
              "cultivate a large diversity of crops"
            ],
            "name": "crop diversity preference",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 17
            },
            "description": "Compared with 20 years ago, how well off is your household? Do you think your life is improving?",
            "items": [
              "the same",
              "worse",
              "better"
            ],
            "name": "wellbeing improvement",
            "type": "select"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 18
            },
            "description": "If yes, where did you learn about it?",
            "name": "climate change source",
            "type": "str"
          },
          {
            "attr": {
              "alternative": {
                "attr": {},
                "items": [
                  "does not apply",
                  "doesn't know / doesn't want to tell"
                ],
                "name": "no information",
                "type": "select"
              },
              "page": 18
            },
            "description": "What does ‘climate change’ mean to you?",
            "name": "climate change meaning",
            "type": "str"
          }
        ],
        "meta": {
          "context": "village",
          "pages": [
            {
              "description": "",
              "title": "Sheet info"
            },
            {
              "description": "",
              "title": "Basic socioeconomic info"
            },
            {
              "description": "",
              "title": "Residence time and history"
            },
            {
              "description": "",
              "title": "Interaction with the city"
            },
            {
              "description": "",
              "title": "Languages and education"
            },
            {
              "description": "",
              "title": "Household Composition"
            },
            {
              "description": "",
              "title": "Houses and physical assets"
            },
            {
              "description": "",
              "title": "Access to information"
            },
            {
              "description": "",
              "title": "Membership to organizations and support"
            },
            {
              "description": "",
              "title": "Livelihood activities"
            },
            {
              "description": "",
              "title": "Food and water security"
            },
            {
              "description": "",
              "title": "Cash income, savings and debts"
            },
            {
              "description": "",
              "title": "Perceived impacts"
            },
            {
              "description": "",
              "title": "General perceptions on climate trends"
            },
            {
              "description": "",
              "title": "Adaptation measures and barriers"
            },
            {
              "description": "",
              "title": "Shifting baselines"
            },
            {
              "description": "",
              "title": "Crop diversity trends"
            },
            {
              "description": "",
              "title": "Subjective wellbeing"
            },
            {
              "description": "",
              "title": "Climate change information"
            },
            {
              "description": "",
              "title": "Pebble game"
            }
          ],
          "privacy": "PRIVATE_LOCAL"
        }
      },
      "description": "",
      "language": "English",
      "parent_type": 0,
      "slug": "survey",
      "title": "Survey",
      "version": 0
    }
  ]
]


