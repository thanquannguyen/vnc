require('dotenv').config();
const simplydjs = require('simply-djs')
const moment = require('moment')
const Discord = require('discord.js');
const { Intents } = require('discord.js')
const request = require('request');
const client = new Discord.Client({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ],
	ws: { properties: { $browser: "Discord iOS" }}
})
const nekoclient = require('nekos.life');
const neko = new nekoclient();
const PREFIX = process.env.PREFIX;
const ms = require(`ms`);
const fs = require('fs');
const picExt = ['.webp', '.png', 'jpg', 'jpeg', 'gif'];
const videoExt = ['.mp4', 'webm', '.mov'];
const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase() }
const fetch = require('node-fetch');
const querystring = require('querystring');
const axios = require('axios');
const canvacord = require("canvacord");
const isValidMessage = (message, cmdName) => message.content.toLowerCase().startsWith(PREFIX + cmdName);
const checkPermissionRole = (role) => role.permissions.has('ADMINISTRATOR') || role.permissions.has('KICK_MEMBERS') || role.permissions.has('BAN_MEMBERS') || role.permissions.has('MANAGE_CHANNELS') || role.permissions.has('MANAGE_GUILD');
const millisToTime = function(milliseconds) {
    let x = milliseconds / 1000;
    let s = Math.floor(x % 60);
    x /= 60;
    let m = Math.floor(x % 60);
    x /= 60;
    let h = Math.floor(x % 24);

    return h + " Giờ, " + m + " Phút, " + s + " Giây";
};
const commandError = (msg, err) => {
    msg.react("❌");
    let embed = new Discord.MessageEmbed();
    embed.setColor("#ff6666");
    embed.setDescription(`:x: ${err}`);
    msg.channel.send({embeds: [embed]})
    .then(msg => {
        setTimeout(() => {
        // const deleteEmbed = new Discord.MessageEmbed();
        msg.delete({embeds: [embed]});
        }, 5000);
    });
}
const permError = msg => {
    msg.react("❌");
    let embed = new Discord.MessageEmbed();
    embed.setColor("#ff6666");
    embed.setDescription(`:x: Bạn không có quyền để dùng lệnh này.`);
    msg.channel.send({embeds: [embed]})
    .then(msg => {
        setTimeout(() => {
        // const deleteEmbed = new Discord.MessageEmbed();
        msg.delete({embeds: [embed]});
        }, 5000);
    });
};

const DEV_MODE = process.env.DEV == 1;
const LOGS_ID = DEV_MODE ? process.env.LOGS_ID : "743017563679883294";

const logMessage = (msg, obj) => {
    let embed = new Discord.MessageEmbed();
    embed.setTimestamp();
    if (obj.serverChange) {
        embed.setColor("#ff6666");
        embed.setThumbnail(client.user.avatarURL);
        embed.addField("Server Change", obj.serverChange);
        embed.addField("Change by", obj.byWho);
        embed.addField("Reason", obj.reason);
        msg.guild.channels.cache.find(id => id.id === LOGS_ID).send({embeds: [embed]});
    } else
    if (obj.modAction) {
        embed.setColor("#ff6666");
        embed.setThumbnail(client.user.avatarURL);
        embed.addField("Staff Action", obj.modAction);
        embed.addField("User", obj.user)
        embed.addField("Action by", obj.byWho);
        embed.addField("Reason", obj.reason);
        msg.guild.channels.cache.find(id => id.id === LOGS_ID).send({embeds: [embed]});
    } else
    if (obj.flaggers) {
        embed.setColor("#ff6666");
        embed.setThumbnail("https://media.discordapp.net/attachments/479408863162925062/485630915586949163/unknown.png");
        embed.addField("Message Author", obj.user);
        embed.addField("Message Content", obj.content);
        embed.addField("Flaggers", obj.flaggers);
        embed.addField("Posted in", obj.channel);
        msg.guild.channels.cache.find(id => id.id === JUNKYARD_ID).send({embeds: [embed]});
    }
}
const sendDM = msg => {
    if (!DEV_MODE) {
        client.users.cache.find(id => id.id === "180690270981980161").send(msg);
    }
};
const sendError = err => {
    let embed = new Discord.MessageEmbed();
    embed.setColor("#e60000");
    embed.setThumbnail(client.user.avatarURL);
    embed.setAuthor("Error!", "https://media.discordapp.net/attachments/386537690260176897/418165473897611274/unknown.png");
    embed.setDescription(err);
    embed.setTimestamp();
    sendDM({embeds: [embed]});
};
const hasManageMessages = msg => {
    if (msg.member.permissions.has("MANAGE_MESSAGES")) {
        return true;
    }
    return false;
}
const hasKickPerms = msg => {
    if (msg.member.permissions.has("KICK_MEMBERS")) {
        return true;
    }
    return false;
}
const hasBanPerms = msg => {
    if (msg.member.permissions.has("BAN_MEMBERS")) {
        return true;
    }
    return false;
}
const hasRolesPerms = msg => {
    if (msg.member.permissions.has("MANAGE_ROLES")) {
        return true;
    }
    return false;
}
const hasManageGuild = msg => {
    if (msg.member.permissions.has("MANAGE_GUILD")) {
        return true;
    }
    return false;
}


const commands = {
    help: {
        name: "help",
        category: "General",
        description: "Toàn bộ lệnh của bot.",
        usage: `${PREFIX}help`,
        do: (message, client, args, Discord) => {
            
            if (!args[0]){
                let embed = new Discord.MessageEmbed();
                embed.setColor("RANDOM");
                embed.setAuthor("Các lệnh của bot:", message.member.avatarURL);
                embed.setDescription(`Để tìm hiểu lệnh chi tiết, dùng ${PREFIX}help "tên lệnh" đó.`);
                embed.addField("<a:VC_wumpus:713187570741149787> Phổ thông:", Object.keys(commands).filter(key => {
                    return commands[key].category === "General";
                }).reduce((acc, curr, idx, arr) => {
                    return acc + curr + (idx === arr.length-1 ? "" : ", ");
                }, ""), false);
                embed.addField("<a:VC_wumpus:713187570741149787> Quản lí (**chỉ dành cho staff**):", Object.keys(commands).filter(key => {
                    return commands[key].category === "Moderation";
                }).reduce((acc, curr, idx, arr) => {
                    return acc + curr + (idx === arr.length-1 ? "" : ", ");
                }, ""), false);
                embed.addField("<a:VC_wumpus:713187570741149787> Fun:", Object.keys(commands).filter(key => {
                    return commands[key].category === "Fun";
                }).reduce((acc, curr, idx, arr) => {
                    return acc + curr + (idx === arr.length-1 ? "" : ", ");
                }, ""), false);
                embed.addField("<a:VC_wumpus:713187570741149787> Account:", Object.keys(commands).filter(key => {
                    return commands[key].category === "Account";
                }).reduce((acc, curr, idx, arr) => {
                    return acc + curr + (idx === arr.length-1 ? "" : ", ");
                }, ""), false);
                embed.addField("<a:VC_wumpus:713187570741149787> VNC:", Object.keys(commands).filter(key => {
                    return commands[key].category === "VNC";
                }).reduce((acc, curr, idx, arr) => {
                    return acc + curr + (idx === arr.length-1 ? "" : ", ");
                }, ""), false);
                embed.setThumbnail(client.user.avatarURL);
                embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
                message.channel.send({embeds: [embed]});
            } else {
                let selection = args[0];
                let embed = new Discord.MessageEmbed();
                embed.setColor("RANDOM");
                embed.setThumbnail(client.user.avatarURL);
                embed.addField("<a:VC_huyhieu:704210627853287516> Cách dùng:", commands[selection].usage);
                embed.addField("<a:VC_huyhieu:704210627853287516> Mô tả:", commands[selection].description);
                embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
                message.channel.send({embeds: [embed]});
            }
        }
    },
    ping: {
        name: "ping",
        category: "General",
        description: "Hiển thị bot mất bao lâu để phản hồi.",
        usage: `${PREFIX}ping`,
        do: (message, client, args, Discord) => {
            
            const embed = new Discord.MessageEmbed();
            embed.setColor("RANDOM");
            embed.setDescription('<a:VC_loading:748831047579598888> Pinging... đợi xíu');
            embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
            embed.setTimestamp();
            message.channel.send({embeds: [embed]}).then(msg => {
                setTimeout(() => {
                const editembed = new Discord.MessageEmbed();
                editembed.setDescription(`<a:VC_dot:714535064788009083> Pong! Mất ${msg.createdTimestamp - message.createdTimestamp}ms.`);
                editembed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
                editembed.setTimestamp();
                msg.edit({embeds: [editembed]});
                }, 2000);
            });
        }
    },
    membercount: {
        name: "membercount",
        category: "General",
        description: "Đếm xem có bao nhiêu member trong server.",
        usage: `${PREFIX}membercount`,
        do: (message, client, args, Discord) => {
            
            let embed = new Discord.MessageEmbed();
            embed.setColor("RANDOM");
            embed.addField(`<a:VC_planet:713187042754035782> Số lượng member: `, `${message.guild.memberCount}`);
            embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
            embed.setTimestamp();
            if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});

        }
    },
    uptime: {
        name: "uptime",
        category: "General",
        description: "Hiển thị bot đã online trong bao lâu.",
        usage: `${PREFIX}uptime`,
        do: (message, client, args, Discord) => {
            
            let embed = new Discord.MessageEmbed();
            embed.setDescription(`<a:VC_luatm:738009858443575336> Bot đã online được **${millisToTime(client.uptime)}**`);
            embed.setColor("RANDOM");
            embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
            embed.setTimestamp();
            if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});
        }
    },
    color: {
        name: "color",
        category: "General",
        description: "Đưa ra màu theo mã hex.",
        usage: `${PREFIX}color <mã hex>`,
        do: (message, client, args, Discord) => {
            let hex = args.slice(0).join(' ')
            if(hex.length == 6) {
                let embed = new Discord.MessageEmbed();
                embed.setImage(`http://placehold.it/300x300.png/${args[0]}/000000&text=%20`);
                embed.setColor(`${hex}`);
                embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
                embed.setTimestamp();
                if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});
            } 
            else if (!hex) {
              var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
              var result = '';
              for ( var i = 0; i < 6; i++ ) {
                result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
              }
              let embed = new Discord.MessageEmbed();
                embed.setImage(`http://placehold.it/300x300.png/${result}/000000&text=%20`);
                embed.setColor(`${result}`);
                embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
                embed.setTimestamp();
                if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});
            }
            else {
                commandError(message, "Hex không đúng!!!");
            }
            // if(hex == "") commandError(message, "Vui lòng nhập mã màu hex");
        }
    }, 
    info: {
        name: "info",
        description: "Thông tin về bot.",
        category: "General",
        usage: `${PREFIX}info`,
        do: (message, client, args, Discord) => {
            
            let embed = new Discord.MessageEmbed();
            embed.setThumbnail(client.user.displayAvatarURL());
            embed.setDescription(`<a:VC_luatm:738009858443575336> Bot đã online được **${millisToTime(client.uptime)}**`);
            embed.addField("<a:VC_huyhieu:704210627853287516> Users", `${client.users.cache.size}`, true);
            embed.addField("<a:VC_huyhieu:704210627853287516> Servers", `${client.guilds.cache.size}`, true);
            embed.addField("<a:VC_k_:704210617405538314> Creators", "<@!180690270981980161>" , true);
            embed.addField("<a:VC_hyperpin:704210602893115422> Invite", "https://discord.gg/vietnamesecommunity", true);
            embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
            embed.setTimestamp();
            embed.setColor("RANDOM");
            if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});
        }
    },
    userinfo: {
        name: "userinfo",
        description: "Xem thông tin bản thân hoặc người dùng được tag. ",
        category: "General",
        usage: `${PREFIX}userinfo`,
        do: (message, client, args, Discord) => {
            let member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
            
            if (member == null) {
                member = message.member
                let embed = new Discord.MessageEmbed();
                embed.setColor("#ff6666");
                embed.setDescription(`:x: Không tìm thấy ID hoặc tên tag, đang chuyển sang tự show info của người ra lệnh. `);
                message.channel.send({embeds: [embed]})
                .then(msg => {
                    setTimeout(() => {
                    // const deleteEmbed = new Discord.MessageEmbed();
                    msg.delete({embeds: [embed]});
                    }, 5000);
                });
            }
            let perms = [];

            let embed = new Discord.MessageEmbed();
            for (let [key, value] of Object.entries(member.permissions.serialize())) {
                if (value == true) {
                    perms.push(key);
                } else {
                    continue;
                }
            }
            embed.setAuthor(member.user.tag, member.user.avatarURL());
            embed.setThumbnail(member.user.avatarURL({dynamic: true, size: 4096}));
            embed.addField("<a:VC_k_:704210617405538314> ID:", member.id, true);
            embed.addField("<a:VC_k_:704210617405538314> Nickname:", (member.nickname != null ? member.nickname : "Không có"), true);
            embed.addField("<a:VC_k_:704210617405538314> Đang game:", (member.presence.game != null ? member.presence.game.name : "Không có"), true);
            embed.addField("<a:VC_k_:704210617405538314> Đã vào server vào:", moment(member.joinedAt).format("LLLL"), true);
            embed.addField("<a:VC_k_:704210617405538314> Đã tạo acc vào:", moment(member.user.createdAt).format("LLLL"), true);
            embed.addField('<a:VC_k_:704210617405538314> Roles:', member.roles.cache.map(r => `${r}`).join(', '), false);
            embed.addField("<a:VC_k_:704210617405538314> Permissions:", perms.map(perm => capitalize(perm.replace(/_/g, ' '))).join(', '), false);
            embed.setColor("RANDOM");
            embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
            embed.setTimestamp();
            setTimeout(() => {
                // const deleteEmbed = new Discord.MessageEmbed();
                if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});
                }, 2000);
        } 
    },
    levels: {
        name: "levels",
        description: "Hiển thị top 10 Mee6.",
        category: "General",
        usage: `${PREFIX}levels`,
        do: (message, client, args, Discord) => {
            
            let serverIcon = message.guild.iconURL({dynamic: true, size: 4096});
            let guild = message.guild.name;
            if (message.guild.members.cache.some(id => id.id === '159985870458322944')) {
                let serverId = message.guild.id;
                request(`https://mee6.xyz/api/plugins/levels/leaderboard/${serverId}`, (err, res, body) => {
                    let data = JSON.parse(body);
                    let topTen = data.players.filter((curr, idx, arr) => {
                        return idx < 10;
                    });
                    if (topTen.length) {
                        let embed = new Discord.MessageEmbed();
                        embed.setColor("RANDOM");
                        topTen.forEach((user, i) => {
                            embed.addField(`<a:VC_phao:704307562178150471> Top  ${i + 1}`, `<@${user.id}> – **${user.xp.toLocaleString()}** Exp – Level **${user.level}**`);
                        });
                        embed.setTitle(`<a:VC_phao:704212731527430194> Top 10 Mee6 ${guild}. <a:VC_phao:704307599532621925>`);
                        embed.setThumbnail(serverIcon);
                        embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
                        embed.setTimestamp();
                        if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                            let embed1 = new Discord.MessageEmbed();
                            embed1.setColor("#ff6666");
//                             embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
			    embed1.setDescription(`:x: Lệnh này tạm thời đã bị cấm trên sảnh chat, vui lòng qua channel spam bot để sử dụng. Nếu staff mute bạn, hãy liên hệ Cừu để có cơ may được ân xá.`);
                            message.channel.send({embeds: [embed1]})
                            .then(msg => {
                                setTimeout(() => {
                                // const deleteEmbed = new Discord.MessageEmbed();
                                msg.delete({embeds: [embed]});
				}, 10000);
//                                 }, 5000);
                            });
//                             setTimeout(() => {
//                               message.channel.send({embeds: [embed]}).then(msg => {
//                                       setTimeout(() => {
//                                         msg.delete({embeds: [embed]});  
//                                       }, 10000);
//                                     })
//                               }, 2000)
                        } else message.channel.send({embeds: [embed]});
                    } else {
                        commandError(message, "Không thể lấy dữ liệu top 10.");
                    }
                });
            } else {
                commandError(message, "Mee6 không có trong server.");
            }
        }
    },
    purge: {
        name: "purge",
        category: "Moderation",
        description: "Xóa tin nhắn, 1-100.",
        usage: `${PREFIX}purge <số tin nhắn>`,
        do: (message, client, args, Discord) => {
            if (hasManageMessages(message)) {
                if (+args[0] <= 100 && +args[0] >= 1) {
                    message.channel.bulkDelete(+args[0] + 1).then(msgs => {
                        let embed = new Discord.MessageEmbed();
                        
                        embed.setDescription(`<a:VC_verify9:745238077739368509> Đã xóa ${msgs.size - 1} tin nhắn`);
                        embed.setColor("RANDOM");
                        embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
                        embed.setTimestamp();
                        message.channel.send({embeds: [embed]})
                        .then(msg => {
                            setTimeout(() => {
                            // const deleteEmbed = new Discord.MessageEmbed();
                            msg.delete({embeds: [embed]});
                            }, 4000);
                        });
                    }
                    
                    )} else {
                    commandError(message, "Cung cấp số lượng ≥ 1 và ≤ 100.");
                }
            } else {
                permError(message);
            }
        }
    },
    ban: {
        name: "ban",
        description: "Ban người dùng.",
        category: "Moderation",
        usage: `${PREFIX}ban <người dùng> <lí do>.\n Nếu người dùng không có trong server, hãy thay tag bằng ID.`,
        do: (message, client, args, Discord) => {
            if (hasBanPerms(message)) {
                let user = message.mentions.users.first() || message.guild.members.cache.get(args[0])
                let reason = args.slice(1).join(" ");
                if (!reason) { 
                    reason = "Không có lý do được đưa ra." 
                }
                if (user) {
			if (user.id == message.author.id) {
			  message.react('❌')
			  message.reply("Tự ban bản thân??? Điên à!!!!")
			  return;
			}
                            message.guild.members.ban(user)
                            // message.guild.ban()
                            .then(u => {
                                // logMessage(message, {
                                //     modAction: "Ban User",
                                //     user: `<@${u.id}>`,
                                //     byWho: `<@${message.author.id}>`,
                                //     reason: reason
                                // });
                                let embed = new Discord.MessageEmbed();
                                embed.setColor("RANDOM");
                                embed.setDescription(`<a:VC_ngu:681756329228238865> Người dùng <@!${user.id}> đã bị ban.`)
                                embed.addField("<a:VC_k_:704210617405538314> Lý do:", reason)
                                embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
                                embed.setTimestamp();
                                message.channel.send({embeds: [embed]});
                                
                                // .then(msg => {
                                //     setTimeout(() => {
                                //     // const deleteEmbed = new Discord.MessageEmbed();
                                //     msg.delete({embeds: [embed]});
                                //     }, 4000);
                                // });
                            })
                            // .catch(e => {
                            //     sendError(e);
                            // });
                        
                   
                   
                } else {
                    commandError(message, "Người dùng không hợp lệ.");
                }
                
            } else {
                permError(message);
            }

        }
    },
    kickk: {
        name: "kickk",
        description: "Kick người dùng.",
        category: "Moderation",
        usage: `${PREFIX}kickk <người dùng> <lí do>.`,
        do: (message, client, args, Discord) => {
            if (hasKickPerms(message)) {
                let user = message.mentions.members.first() || message.guild.members.cache.get(args[0])
                let reason = args.slice(1).join(" ");
                if (!reason) { 
                    reason = "Không có lý do được đưa ra." 
                }
                if (user) {
			if (user.id == message.author.id) {
			  message.react('❌')
			  message.reply("Tự kick bản thân??? Điên à!!!!")
			  return;
			}
                    const member = message.guild.member(user);
                    if (member) {
                            member.kick(reason)
                            .then(u => {
                                // logMessage(message, {
                                //     modAction: "Kick User",
                                //     user: `<@${u.id}>`,
                                //     byWho: `<@${message.author.id}>`,
                                //     reason: reason
                                // });
                                let embed = new Discord.MessageEmbed();
                                embed.setColor("RANDOM");
                                embed.setDescription(`<a:VC_ngu:681756329228238865> Người dùng <@!${member.id}> đã bị kick.`)
                                embed.addField("<a:VC_k_:704210617405538314> Lý do:", reason)
                                embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
                                embed.setTimestamp();
                                message.channel.send({embeds: [embed]});
                                // .then(msg => {
                                //     setTimeout(() => {
                                //     // const deleteEmbed = new Discord.MessageEmbed();
                                //     msg.delete({embeds: [embed]});
                                //     }, 4000);
                                // });
                            })
                            .catch(e => {
                                sendError(e);
                            });
                        
                    } else {
                        commandError(message, "Người dùng không có trong server, thử cung cấp thay thế bằng ID");
                    }

                } else {
                    commandError(message, "Người dùng không hợp lệ.");
                }
                
            } else {
                permError(message);
            }

        }
    },
    unban: {
        name: "unban",
        description: "Gỡ ban người dùng.",
        category: "Moderation",
        usage: `${PREFIX}unban <ID người dùng> <lí do>.`,
        do: (message, client, args, Discord) => {
            if (hasBanPerms(message)) {
                let userID = args[0]
                let reason = args.slice(1).join(" ");
                if (!reason) { 
                    reason = "Không có lý do được đưa ra." 
                }
                if (userID) {
//                                 message.guild.members.unban(userID)
//                                 .then(u => {
//                                 logMessage(message, {
//                                     modAction: "Unban User",
//                                     user: `<@${u.id}>`,
//                                     byWho: `<@${message.author.id}>`,
//                                     reason: reason
//                                 });
                        
                                let embed = new Discord.MessageEmbed();
                                embed.setColor("RANDOM");
                                embed.setDescription(`<a:VC_colorheartr:711453955758227467> Người dùng <@${userID}> đã được gỡ ban.`)
                                embed.addField("<a:VC_k_:704210617405538314> Lý do:", reason)
                                embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
                                embed.setTimestamp();
                                message.channel.send({embeds: [embed]});
                            //     .then(msg => {
                            //         setTimeout(() => {
                            //         // const deleteEmbed = new Discord.MessageEmbed();
                            //         msg.delete({embeds: [embed]});
                            //         }, 4000);
                            //     });
                            // })
                            // .catch(e => {
                            //     sendError(e);
                            // });

                } else {
                    commandError(message, "Người dùng không hợp lệ.");
                }
                
            } else {
                permError(message);
            }

        }
    },
    say: {
        name: "say",
        description: "Bot gửi tin nhắn với nội dung của người ra lệnh.",
        category: "General",
        usage: `${PREFIX}say <nội dung>`,
        do: (message, client, args, Discord) => {
            if (message.content.toLowerCase().includes(`<@&`) || message.content.toLowerCase().includes(`@everyone`) || message.content.toLowerCase().includes(`@here`)) {
                commandError(message, `Bạn đang lợi dụng lệnh để tag role, điều này bị cấm.`)
                return;
            }
            if (!args.join(' ')) {
                message.delete(message.author)
                return
            }
            else message.channel.send({content: args.join(' ')}).then(message.delete(message.author));
        }

    },
    embed: {
        name: "embed",
        description: "Bot gửi tin nhắn embed với nội dung của người ra lệnh.",
        category: "General",
        usage: `${PREFIX}embed <nội dung>`,
        do: (message, client, args, Discord) => {
            let embed = new Discord.MessageEmbed();
            embed.setDescription(`${args.join(' ')}`)
            embed.setColor("RANDOM");
            if (message.content.toLowerCase().includes(`<@&`) || message.content.toLowerCase().includes(`@everyone`) || message.content.toLowerCase().includes(`@here`)) {
                commandError(message, `Bạn đang lợi dụng lệnh để tag role, điều này bị cấm.`)
                return;
            }
            if (!args.join(' ')) {
                message.delete(message.author)
                return
            }
            else message.channel.send({embeds: [embed]}).then(message.delete(message.author));
        }
    },
     edit: {
      name: "edit",
      description: "Sửa nội dung tin nhắn của bot VNC.",
      category: "Moderation",
      usage: `${PREFIX}edit <ID tin nhắn> <nội dung>`,
      do: (message, client, args, Discord) => {
        if (message.author.id === "180690270981980161") {
          let msgId = args[0]
          message.delete(message.author);
          const embed = new Discord.MessageEmbed();
          embed.setColor("RANDOM");
          embed.setDescription('<a:VC_loading:748831047579598888> Đã sửa thành công...');
          embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
          embed.setTimestamp();
          message.channel.send({embeds: [embed]}).then(msg => {
              setTimeout(() => {
              msg.delete({embeds: [embed]});
              }, 2000);
          });
          message.channel.messages.fetch({around: msgId, limit: 1})
          .then(msg => {
              const fetchedMsg = msg.first();
              // const editembed = new Discord.MessageEmbed();
              //   editembed.setDescription(`${args.slice(1).join(' ')}`);
              //   editembed.setColor("RANDOM")
              fetchedMsg.edit(args.slice(1).join(' '));
          });
          
        }  else commandError(message, "Chỉ có chủ bot mới chạy được lệnh này");
      }
    },
    editembed: {
      name: "editembed",
      description: "Sửa nội dung tin nhắn embed của bot VNC.",
      category: "Moderation",
      usage: `${PREFIX}editembed <ID tin nhắn> <nội dung>`,
      do: (message, client, args, Discord) => {
        if (message.author.id === "180690270981980161") {
          let msgId = args[0]
          message.delete(message.author);
          const embed = new Discord.MessageEmbed();
          embed.setColor("RANDOM");
          embed.setDescription('<a:VC_loading:748831047579598888> Đã sửa thành công...');
          embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
          embed.setTimestamp();
          message.channel.send({embeds: [embed]}).then(msg => {
              setTimeout(() => {
              msg.delete({embeds: [embed]});
              }, 2000);
          });
          message.channel.messages.fetch({around: msgId, limit: 1})
          .then(msg => {
              const fetchedMsg = msg.first();
              const editembed = new Discord.MessageEmbed();
                editembed.setDescription(`${args.slice(1).join(' ')}`);
                editembed.setColor("RANDOM")
              fetchedMsg.edit({embeds: [editembed]});
          });
          
        }  else commandError(message, "Chỉ có chủ bot mới chạy được lệnh này");
      }
    },
    
    avatar: {
        name: "avatar",
        description: "Hiển thị avatar của người được tag hoặc chính người ra lệnh.",
        category: "General",
        usage: `${PREFIX}avatar <tag người dùng hoặc username người dùng>`,
        do: (message, client, args, Discord) => {
            let member = message.mentions.users.first()
            if (!member) {
              if (args[0] == null) {
                  let embed = new Discord.MessageEmbed();
                  embed.setColor("RANDOM")
                  embed.setAuthor(`${message.author.tag}`)
                  embed.setImage(message.author.avatarURL({ dynamic: true, size: 4096}))
                  embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
                  if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});
              } else {
            member = message.content.substring(8)
            let username = client.users.cache.find(u => u.username === member)
            let embed = new Discord.MessageEmbed();
            embed.setColor("RANDOM")
            embed.setAuthor(`${username.tag}`)
            embed.setImage(username.avatarURL({ dynamic: true, size: 4096}))
            embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
            if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});
                }
            } 
            else {
                let embed = new Discord.MessageEmbed();
                embed.setColor("RANDOM")
                embed.setAuthor(`${member.tag}`)
                embed.setImage(member.avatarURL({ dynamic: true, size: 4096}))
                embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
                if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});
            }

        }
    },
    mute: {
        name: "mute",
        description: "Mute người dùng",
        category: "Moderation",
        usage: `${PREFIX}mute <người dùng> <thời gian: s/m/h/d> <lí do>.`,
        do: (message, client, args, Discord) => {
            if (hasRolesPerms(message)) {
                const user = message.mentions.users.first() || message.guild.members.cache.get(args[0])
                let reason = args.slice(2).join(" ");
                let time = args[2]
                if (!reason) { 
                    reason = "Không có lý do được đưa ra." 
                }
                if  (!time) {
                    time = "15m"
                    reason = args.slice(2).join(" ");
                }
                
                if (user) {
                    const member = message.guild.member(user)
                    if(member) {
                        let mutedRole = message.guild.roles.cache.find(mute => mute.name == "Muted")
                        if(mutedRole) {
                            if(member.roles.cache.has(mutedRole.id)) {
                                commandError(message, "Người dùng đã bị mute sẵn.")
                                return;
                            } else {
                            member.roles.add(mutedRole, reason).then(u => {
                                logMessage(message, {
                                    modAction: "Mute User", 
                                    user: `<@${u.id}>`,
                                    byWho: `<@${message.author.id}>`,
                                    reason: reason
                                });

                                let embed = new Discord.MessageEmbed();
                                embed.setColor("GREEN")
                                embed.setDescription(`<a:VC_verify9:745238077739368509> ${member} đã bị mute ${ms(ms(time))}.`)
                                embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL())
                                embed.setTimestamp()
                                message.channel.send({embeds: [embed]}).then(u => {
                                    setTimeout(() => {
                                        member.roles.remove(mutedRole);
                                    }, ms(ms(time)));
                                })

                            }).catch(e => {
                                sendError(e);
                            });
                            }
                        } else{
                            let embed = new Discord.MessageEmbed();
                            embed.setColor("GREEN")
                            embed.setDescription(`<a:VC_loading:748831047579598888> Bắt đầu quá trình tạo role **Muted** cho server ${message.guild.name}\n Quá trình này chỉ xảy ra 1 lần...`)
                            message.guild.roles.create({ 
                                data: {
                                    name: `Muted`,
                                    color: `#000000`,
                                },
                                reason: `Server chưa có role Muted.`
                            })
                            commandError(message, "Muted role chưa có trong server")
                            .then(u => { u.channel.send({embeds: [embed]}) })
                            .then(role => {
                                if (message.guild.roles.cache.find(mute => mute.name.toLowerCase() === "Muted")) {
                                let editembed = new Discord.MessageEmbed();
                                editembed.setColor("GREEN")
                                editembed.setDescription(`Role Muted đã tạo, hãy thử lại lệnh **${PREFIX}mute**`)
                                setTimeout(() => {
                                    role.edit(editembed)    
                                }, 5000).then(del => {
                                    setTimeout(() => {
                                        del.delete(editembed)
                                    }, 5000)
                                })
                                }
                            })
                        }
                    } else commandError(message, "Người dùng không có trong server.")

                } else commandError(message, "Không tìm thấy user.")

            } else permError(message);
        }
    },
    hug: {
        name: "hug",
        description: "Ôm ai đó",
        category: "Fun",
        usage: `${PREFIX}hug <user>`,
        do : (message, client, args, Discord) => {
            let member = message.mentions.members.first();
            if (member == null) {member = message.member;}
            neko.sfw.hug().then(json => {
            let embed = new Discord.MessageEmbed();
            embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
            embed.setTimestamp();
            embed.setColor("RANDOM")
            embed.setTitle(`${message.author.tag} ôm ${member.user.tag}`)
            embed.setImage(json.url);
            if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});

        })
        }
    },
    kiss: {
        name: "kiss",
        description: "Hun ai đó",
        category: "Fun",
        usage: `${PREFIX}kiss <user>`,
        do : (message, client, args, Discord) => {
            let member = message.mentions.members.first();
            if (member == null) {member = message.member;}
            neko.sfw.kiss().then(json => {
            let embed = new Discord.MessageEmbed();
            embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
            embed.setTimestamp();
            embed.setColor("RANDOM")
            embed.setTitle(`${message.author.tag} hun ${member.user.tag} chụt chụt`)
            embed.setImage(json.url);
            if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});

        })
        }
    },
    slap: {
        name: "slap",
        description: "Tát ai đó",
        category: "Fun",
        usage: `${PREFIX}slap <user>`,
        do : (message, client, args, Discord) => {
            let member = message.mentions.members.first();
            if (member == null) {member = message.member;}
            neko.sfw.slap().then(json => {
            let embed = new Discord.MessageEmbed();
            embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
            embed.setTimestamp();
            embed.setColor("RANDOM")
            embed.setTitle(`${message.author.tag} tát ${member.user.tag}`)
            embed.setImage(json.url);
            if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});

        })
        }
    },
    pat: {
        name: "pat",
        description: "Pat ai đó",
        category: "Fun",
        usage: `${PREFIX}slap <user>`,
        do : (message, client, args, Discord) => {
            let member = message.mentions.members.first();
            if (member == null) {member = message.member;}
            neko.sfw.pat().then(json => {
            let embed = new Discord.MessageEmbed();
            embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
            embed.setTimestamp();
            embed.setColor("RANDOM")
            embed.setTitle(`${message.author.tag} pat pat ${member.user.tag}`)
            embed.setImage(json.url);
            if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});

        })
        }
    },
    kick: {
        name: "kick",
        description: "Đá ai đó",
        category: "Fun",
        usage: `${PREFIX}kick <user>`,
        do : (message, client, args, Discord) => {
            let member = message.mentions.members.first();
            if (member == null) {member = message.member;}
            let embed = new Discord.MessageEmbed();
            embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
            embed.setTimestamp();
            embed.setColor("RANDOM")
            embed.setTitle(`${message.author.tag} đá ${member.user.tag}`)
            embed.setImage("https://cdn.discordapp.com/attachments/751633399516627036/751645738395500584/kick1.gif");
            if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});
        }
    },
    tickle: {
        name: "tickle",
        description: "Thọc lét ai đó",
        category: "Fun",
        usage: `${PREFIX}slap <user>`,
        do : (message, client, args, Discord) => {
            let member = message.mentions.members.first();
            if (member == null) {member = message.member;}
            neko.sfw.tickle().then(json => {
            let embed = new Discord.MessageEmbed();
            embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
            embed.setTimestamp();
            embed.setColor("RANDOM")
            embed.setTitle(`${message.author.tag} thọc lét ${member.user.tag}`)
            embed.setImage(json.url);
            if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});

        })
        }
    },
    baka: {
        name: "baka",
        description: "Nói ai đó là đồ ngốc",
        category: "Fun",
        usage: `${PREFIX}slap <user>`,
        do : (message, client, args, Discord) => {
            let member = message.mentions.members.first();
            if (member == null) {member = message.member;}
            neko.sfw.baka().then(json => {
            let embed = new Discord.MessageEmbed();
            embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
            embed.setTimestamp();
            embed.setColor("RANDOM")
            embed.setTitle(`${member.user.tag} là đồ ngốk`)
            embed.setImage(json.url);
            if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});

        })
        }
    },
    poke: {
        name: "poke",
        description: "Chọt ai đó",
        category: "Fun",
        usage: `${PREFIX}slap <user>`,
        do : (message, client, args, Discord) => {
            let member = message.mentions.members.first();
            if (member == null) {member = message.member;}
            neko.sfw.poke().then(json => {
            let embed = new Discord.MessageEmbed();
            embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
            embed.setTimestamp();
            embed.setColor("RANDOM")
            embed.setTitle(`${message.author.tag} chọt ${member.user.tag}`)
            embed.setImage(json.url);
            if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});
        })
        }
    },
    feed: {
        name: "feed",
        description: "Cho ăn ai đó",
        category: "Fun",
        usage: `${PREFIX}slap <user>`,
        do : (message, client, args, Discord) => {
            let member = message.mentions.members.first();
            if (member == null) {member = message.member;}
            neko.sfw.feed().then(json => {
            let embed = new Discord.MessageEmbed();
            embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
            embed.setTimestamp();
            embed.setColor("RANDOM")
            embed.setTitle(`${message.author.tag} cho ${member.user.tag} ăn`)
            embed.setImage(json.url);
            if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});

        })
        }
    },
    cuddle: {
        name: "cuddle",
        description: "Âu yếm ai đó",
        category: "Fun",
        usage: `${PREFIX}slap <user>`,
        do : (message, client, args, Discord) => {
            let member = message.mentions.members.first();
            if (member == null) {member = message.member;}
            neko.sfw.cuddle().then(json => {
            let embed = new Discord.MessageEmbed();
            embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
            embed.setTimestamp();
            embed.setColor("RANDOM")
            embed.setTitle(`${message.author.tag} âu yếm ${member.user.tag}`)
            embed.setImage(json.url);
            if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});

        })
        }
    },
    nacnac: {
        name: "nacnac",
        description: "Nắc nắc",
        category: "Fun",
        usage: `${PREFIX}nacnac`,
        do : (message, client, args, Discord) => {
            let embed = new Discord.MessageEmbed();
            embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
            embed.setTimestamp();
            embed.setColor("RANDOM")
            embed.setImage("https://cdn.discordapp.com/attachments/751633399516627036/764548500728840222/759364625836933130.gif");
            if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
                      let embed1 = new Discord.MessageEmbed();
                      embed1.setColor("#ff6666");
                      embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
                      message.channel.send({embeds: [embed1]})
                      .then(msg => {
                          setTimeout(() => {
                          // const deleteEmbed = new Discord.MessageEmbed();
                          msg.delete({embeds: [embed]});
                          }, 5000);
                      });
                      setTimeout(() => {
                        message.channel.send({embeds: [embed]}).then(msg => {
                                setTimeout(() => {
                                  msg.delete({embeds: [embed]});  
                                }, 10000);
                              })
                        }, 2000)
                  } else message.channel.send({embeds: [embed]});
        }
    },
    testwelcome: {
        name: "testwelcome",
        description: "Test Welcome",
        category: "Moderation",
        usage: `${PREFIX}testwelcome`,
        do: async (message, client, args, Discord) => {
            const canvas = require("discord-canvas"),  
            welcomeCanvas = await new canvas.Welcome();
            let image = await welcomeCanvas
              .setUsername(message.author.username)
              .setDiscriminator(message.author.discriminator)
              .setMemberCount(message.guild.memberCount)
              .setGuildName(message.author.name)
              .setAvatar(message.author.displayAvatarURL({ format: "png", size: 4096}))
              .setColor("border", "#6600ff")
              .setColor("username-box", "#6200ff")
              .setColor("discriminator-box", "#6200ff")
              .setColor("message-box", "#6200ff")
              .setColor("title", "#008cff")
              .setColor("avatar", "#008cff")
              .setText("member-count", "- {count} members ")
              .setText("title", "welcome")
              .setText("message", "welcome to VNC")
              .setBackground("https://cdn.discordapp.com/attachments/719613863854604391/816318649950404608/123.jpg")
              .toAttachment();

              let attachment = new Discord.MessageAttachment(image.toBuffer(), "welcome-image.png");

            message.channel.send({
                content: 
                `
<a:VC_tada_p:705995469607927828>  Chào mừng ${message.author}, thành viên thứ ${message.guild.memberCount}.
<a:VC_muiten:704210750503125002> Hãy nói lời chào tại <#719613863854604391>.
<a:VC_starrycloud:755471583149031445> English chat in <#772780088881315850>.
<a:VC_Diamond:704210418096144464> Lấy roles tại <#698356548065427496>.
<a:VC_verify18:752528586350526504> Đừng quên đọc <#683261991351091217> để hiểu luật và thông tin server nhé!
<a:VC_colorheart:704210543635988531> Chúc các bạn có khoảng thời gian vui vẻ tại server!
                `,
                files: [attachment]
            })
        }
    },
    // covid: {
    //     name: "covid",
    //     description: "Thông tin Covid-19 Vietnam và thế giới",
    //     category: "General",
    //     usage: `${PREFIX}covid`,
    //     do: (message, client, args, Discord) => {
    //     request("https://code.junookyo.xyz/api/ncov-moh/data.json", (err, response, body) => {
    //     if (err) throw(err);
    //     var data = JSON.parse(body);

    //     let vietnam = new Discord.MessageEmbed()
    //     .setColor("RANDOM")
    //     .setTitle("Thống kê tại Việt Nam và Thế giới")
    //     .addField('‎ ‎', "‏‏‎**Tại Việt Nam:**‎", true)
    //     .addField('☢️Nhiễm:', data.data.vietnam.cases)
    //     .addField('🍀Hồi phục:', data.data.vietnam.recovered)
    //     .addField('☠️Tử vong:', data.data.vietnam.deaths)
    //     .addField('‎ ‎', "‏‏‎**Tại Thế giới:**‎", true)
    //     .addField('☢️Nhiễm:', data.data.global.cases)
    //     .addField('🍀Hồi phục:', data.data.global.recovered)
    //     .addField('☠️Tử vong:', data.data.global.deaths)
    //     .addField('‏‏‎ ‎','Api thuộc về **JUNO_OKYO**')
    //     .setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
    //     message.channel.send(vietnam);      
    //     });                 
    //     }
    // },
    dms: {
        name: "dms",
        description: "Ra lệnh cho bot gửi tin nhắn riêng tư",
        category: "Moderation",
        usage: `${PREFIX}dms <nội dung>`,
        do: (message, client, args, Discord) => {
        if (message.author.id === "180690270981980161") {
          let dms = args.slice(1).join(' ')
          message.delete(message.author);
          const embed = new Discord.MessageEmbed();
          embed.setColor("RANDOM");
          embed.setDescription('<a:VC_loading:748831047579598888> Sent...');
          embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
          embed.setTimestamp();
          message.channel.send({embeds: [embed]}).then(msg => {
              setTimeout(() => {
              msg.delete({embeds: [embed]});
              }, 2000);
          });
          client.users.fetch(args[0]).then((user) => {
            user.send(dms);
          });  
        } else commandError(message, "Chỉ có chủ bot mới chạy được lệnh này");
      }
    },
    // cfs: {
    //     name: "cfs",
    //     description: "Gửi confession (chỉ gửi được bằng cách nhắn tin riêng với bot)",
    //     category: "General",
    //     usage: `${PREFIX}cfs <nội dung>`,
    //     do: async (message, client, args, Discord, reaction) => {
    //       if (message.author.bot) return;
    //       if (message.channel.type !== 'dm') return;
    //       if (message.content.length > 1024) return message.channel.send(`Confession chỉ được dưới 1024 kí tự.`);
    //       else {
    //           await message.react(`💌`);
    //           let embed = new Discord.MessageEmbed();
    //           embed.setDescription("Confession của bạn đã được gửi đi và đang trong quá trình chờ duyệt.");
    //           embed.setFooter(`Cú pháp để gửi: vccfs <nội dung>`, `https://cdn.discordapp.com/attachments/758637445792661524/831726403866460200/VNC.gif`)
    //           embed.setColor("RANDOM");
    //           embed.setTimestamp();
    //           message.reply({embeds: [embed]});
    //           const cfsChannel = client.channels.cache.get(`769447454281695272`);
    //           const logChannel = client.channels.cache.get(`776446102558867456`);
    //           let embed2 = new Discord.MessageEmbed();
    //           embed2.setTitle(`Confession`);
    //           embed2.setDescription(`${message.author}: ${args.join(' ')}`);
    //           if (message.attachments.values().length > 0) {
    //           let attachment = message.attachments.values()[0];
    //           picExt.forEach(ext => {
    //           if(attachment.name.endsWith(ext)) logChannel.send(attachment).then((message) => {
    //             message.react('✅').then(() => {
    //                 message.react('❌')
    //               })
    //               .then(() => {
    //                 message.awaitReactions((reaction, user) => user.id != `597038329552437254` && (reaction.emoji.name == '✅' || reaction.emoji.name == '❌'),
    //                 { max: 1}).then(collected => {
    //                         if (collected.first().emoji.name == '✅') {
    //                             let embed = new Discord.MessageEmbed();
    //                             embed.setDescription("Đã duyệt cfs và đăng lên.");
    //                             embed.setFooter(`Cú pháp để gửi: vccfs <nội dung>`, `https://cdn.discordapp.com/attachments/758637445792661524/831726403866460200/VNC.gif`)
    //                             embed.setColor("00ff11");
    //                             embed.setTimestamp();
    //                             message.channel.send({embeds: [embed]});   

    //                             count++;    
    //                             if (!cfsChannel) return;
    //                             let embed1 = new Discord.MessageEmbed();
    //                             embed1.setTitle(`Confession`);
    //                             embed1.setDescription(`${args.join(' ')}`);
    //                             embed1.setThumbnail(`https://cdn.discordapp.com/attachments/758637445792661524/831726403866460200/VNC.gif`);
    //                             embed1.setFooter(`Cú pháp để gửi: vccfs <nội dung>`, `https://cdn.discordapp.com/attachments/758637445792661524/831726403866460200/VNC.gif`)
    //                             embed1.setColor("RANDOM");
    //                             embed1.setTimestamp();
    //                             if (message.attachments.values().length > 0) {
    //                             let attachment = message.attachments.values()[0];
    //                             picExt.forEach(ext => {
    //                             if(attachment.name.endsWith(ext)) embed1.setImage(attachment.attachment);
    //                             });
    //                             videoExt.forEach(ext => {
    //                             if(attachment.name.endsWith(ext)) cfsChannel.send(attachment);
    //                             });
    //                             }
    //                             // embed1.setThumbnail(message.guild.iconURL({dynamic: true, size: 4096}));
    //                             cfsChannel.send({embeds: [embed1]});
    //                         }
    //                         else {
    //                             let embed = new Discord.MessageEmbed();
    //                             embed.setDescription("Đã từ chối duyệt cfs.");
    //                             embed.setFooter(`Cú pháp để gửi: vccfs <nội dung>`, `https://cdn.discordapp.com/attachments/758637445792661524/831726403866460200/VNC.gif`)
    //                             embed.setColor("ff0000");
    //                             embed.setTimestamp();
    //                             message.channel.send({embeds: [embed]});    
    //                         }
    //                 })
    //               })
    //           });
    //           });
    //           videoExt.forEach(ext => {
    //           if(attachment.name.endsWith(ext)) logChannel.send(attachment).then((message) => {
    //             message.react('✅').then(() => {
    //                 message.react('❌')
    //               })
    //               .then(() => {
    //                 message.awaitReactions((reaction, user) => user.id != `597038329552437254` && (reaction.emoji.name == '✅' || reaction.emoji.name == '❌'),
    //                 { max: 1}).then(collected => {
    //                         if (collected.first().emoji.name == '✅') {
    //                             let embed = new Discord.MessageEmbed();
    //                             embed.setDescription("Đã duyệt cfs và đăng lên.");
    //                             embed.setFooter(`Cú pháp để gửi: vccfs <nội dung>`, `https://cdn.discordapp.com/attachments/758637445792661524/831726403866460200/VNC.gif`)
    //                             embed.setColor("00ff11");
    //                             embed.setTimestamp();
    //                             message.channel.send({embeds: [embed]});   

    //                             if (!cfsChannel) return;
    //                             let embed1 = new Discord.MessageEmbed();
    //                             embed1.setTitle(`Confession`);
    //                             embed1.setDescription(`${args.join(' ')}`);
    //                             embed1.setThumbnail(`https://cdn.discordapp.com/attachments/758637445792661524/831726403866460200/VNC.gif`);
    //                             embed1.setFooter(`Cú pháp để gửi: vccfs <nội dung>`, `https://cdn.discordapp.com/attachments/758637445792661524/831726403866460200/VNC.gif`)
    //                             embed1.setColor("RANDOM");
    //                             embed1.setTimestamp();
    //                             if (message.attachments.values().length > 0) {
    //                             let attachment = message.attachments.values()[0];
    //                             picExt.forEach(ext => {
    //                             if(attachment.name.endsWith(ext)) embed1.setImage(attachment.attachment);
    //                             });
    //                             videoExt.forEach(ext => {
    //                             if(attachment.name.endsWith(ext)) cfsChannel.send(attachment);
    //                             });
    //                             }
    //                             // embed1.setThumbnail(message.guild.iconURL({dynamic: true, size: 4096}));
    //                             cfsChannel.send({embeds: [embed1]});
    //                         }
    //                         else {
    //                             let embed = new Discord.MessageEmbed();
    //                             embed.setDescription("Đã từ chối duyệt cfs.");
    //                             embed.setFooter(`Cú pháp để gửi: vccfs <nội dung>`, `https://cdn.discordapp.com/attachments/758637445792661524/831726403866460200/VNC.gif`)
    //                             embed.setColor("ff0000");
    //                             embed.setTimestamp();
    //                             message.channel.send({embeds: [embed]});    
    //                         }
    //                 })
    //               })
    //           });
    //           });
    //           }
    //           embed2.setFooter(`Cú pháp để gửi: vccfs <nội dung>`, `https://cdn.discordapp.com/attachments/758637445792661524/831726403866460200/VNC.gif`)
    //           embed2.setColor("RANDOM");
    //           embed2.setTimestamp();
    //         //   logChannel.send(`Cfs số ${count}: ${message.content} | Người gửi ${message.author}`);
    //           logChannel.send(embed2).then((message) => {
    //             message.react('✅').then(() => {
    //                 message.react('❌')
    //               })
    //               .then(() => {
    //                 message.awaitReactions((reaction, user) => user.id != `597038329552437254` && (reaction.emoji.name == '✅' || reaction.emoji.name == '❌'),
    //                 { max: 1}).then(collected => {
    //                         if (collected.first().emoji.name == '✅') {
    //                             let embed = new Discord.MessageEmbed();
    //                             embed.setDescription("Đã duyệt cfs và đăng lên.");
    //                             embed.setFooter(`Cú pháp để gửi: vccfs <nội dung>`, `https://cdn.discordapp.com/attachments/758637445792661524/831726403866460200/VNC.gif`)
    //                             embed.setColor("00ff11");
    //                             embed.setTimestamp();
    //                             message.channel.send({embeds: [embed]});   

    //                             if (!cfsChannel) return;
    //                             let embed1 = new Discord.MessageEmbed();
    //                             embed1.setTitle(`Confession`);
    //                             embed1.setDescription(`${args.join(' ')}`);
    //                             embed1.setThumbnail(`https://cdn.discordapp.com/attachments/758637445792661524/831726403866460200/VNC.gif`);
    //                             embed1.setFooter(`Cú pháp để gửi: vccfs <nội dung>`, `https://cdn.discordapp.com/attachments/758637445792661524/831726403866460200/VNC.gif`)
    //                             embed1.setColor("RANDOM");
    //                             embed1.setTimestamp();
    //                             if (message.attachments.values().length > 0) {
    //                             let attachment = message.attachments.values()[0];
    //                             picExt.forEach(ext => {
    //                             if(attachment.name.endsWith(ext)) embed1.setImage(attachment.attachment);
    //                             });
    //                             videoExt.forEach(ext => {
    //                             if(attachment.name.endsWith(ext)) cfsChannel.send(attachment);
    //                             });
    //                             }
    //                             // embed1.setThumbnail(message.guild.iconURL({dynamic: true, size: 4096}));
    //                             cfsChannel.send({embeds: [embed1]});

    //                         }
    //                         else {
    //                             let embed = new Discord.MessageEmbed();
    //                             embed.setDescription("Đã từ chối duyệt cfs.");
    //                             embed.setFooter(`Cú pháp để gửi: vccfs <nội dung>`, `https://cdn.discordapp.com/attachments/758637445792661524/831726403866460200/VNC.gif`)
    //                             embed.setColor("ff0000");
    //                             embed.setTimestamp();
    //                             message.channel.send({embeds: [embed]});    
    //                         }
    //                 })
    //               })
    //           })
    //         }
    //     }
    //   },
      vote: {
        name: "vote",
        description: "Vote cho server và bot",
        category: "VNC",
        usage: `${PREFIX}vote`,
        do: async (message, client, args, Discord) => {
        let embed = new Discord.MessageEmbed();
        embed.setTitle("VOTE FOR VNC");
        embed.addField(`<a:VC_star:752528894384669050> Vote cho bot VNC`, `[Ấn vào đây](https://top.gg/bot/597038329552437254/vote)`)
        embed.addField(`<a:VC_star:752528894384669050> Vote cho server VNC`, `[Ấn vào đây](https://top.gg/servers/338907205619286026/vote)`)
        embed.setColor("RANDOM");
        embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
        embed.setTimestamp();
        message.channel.send({embeds: [embed]});
        }
      },
      canva: {
        name: "canva",
        description: "Nâng cấp tài khoản Canva chính chủ của bạn lên Canva Pro",
        category: "Account",
        usage: `${PREFIX}canva`,
        do: async (message, client, args, Discord) => {
        let embed = new Discord.MessageEmbed();
        embed.setTitle("NÂNG CẤP TÀI KHOẢN CANVA PRO");
        embed.addField(`<a:VC_star:752528894384669050> Nâng cấp tài khoản Canva của bạn lên thành Canva Pro bằng cách tham gia vào "lớp học VNC" theo đường link sau:`, `[Ấn vào đây](https://www.canva.com/brand/join?token=OJO_jlarbH7YVyEFNxPe-w&brandingVariant=edu&referrer=team-invite)`)
        embed.setDescription("Sau khi các bạn đã nâng cấp thành công hãy vào server VNC, vào channel show ảnh + tag Cừu để tránh bị lọc bởi hệ thống")
        embed.setColor("RANDOM");
        embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
        embed.setTimestamp();
        message.channel.send({embeds: [embed]});
        }
      },
    //   invites: {
    //     name: "invites",
    //     description: "Thông tin top inviter",
    //     category: "General",
    //     usage: `${PREFIX}invites`,
    //     do: async (message, client, args, Discord) => {
    //       const { guild } = message
    //       guild.fetchInvites().then((invites) => {
    //         const inviteCounter = {
    //           test: 0,
    //         }

    //         invites.forEach((invite) => {
    //           const { uses, inviter } = invite
    //           const { username, discriminator } = inviter

    //           const name = `${username}#${discriminator}`

    //           inviteCounter[name] = (inviteCounter[name] || 0) + uses
    //         })

    //         let replyText = ''

    //         const sortedInvites = Object.keys(inviteCounter).sort(
    //           (a, b) => inviteCounter[b] - inviteCounter[a]
    //         )

    //          sortedInvites.length = 20

    //         for (const invite of sortedInvites) {
    //           const count = inviteCounter[invite]
    //           replyText += `\n <a:VC_phao:704307562178150471> \`${invite}\` đã mời ${count} member(s)`
    //         }

    //         const embed = new Discord.MessageEmbed();
    //           embed.setColor("RANDOM");
    //           embed.setDescription(replyText);
    //           embed.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
    //           embed.setTimestamp();
    //           if (message.channel.id == '719613863854604391' || message.channel.id == '772780088881315850') {
    //                   let embed1 = new Discord.MessageEmbed();
    //                   embed1.setColor("#ff6666");
    //                   embed1.setDescription(`:x: Bot xuất hiện ở channel chat, sau 10s bot sẽ tự xoá lệnh để dọn dẹp chat`);
    //                   message.channel.send({embeds: [embed1]})
    //                   .then(msg => {
    //                       setTimeout(() => {
    //                       // const deleteEmbed = new Discord.MessageEmbed();
    //                       msg.delete({embeds: [embed]});
    //                       }, 5000);
    //                   });
    //                   setTimeout(() => {
    //                     message.channel.send({embeds: [embed]}).then(msg => {
    //                             setTimeout(() => {
    //                               msg.delete({embeds: [embed]});  
    //                             }, 10000);
    //                           })
    //                     }, 2000)
    //               } else message.channel.send({embeds: [embed]});
    //       })
    //     }
    //   }, 
      caro: {
        name: "caro",
        description: "Caro",
        category: "General",
        usage: `${PREFIX}caro <người chơi cùng>`,
        do: (message, client, args, Discord) => {
            simplydjs.tictactoe(client, message, {
            embedColor:"RANDOM",
            credit: false,
          })
        } 
    },
    ytt: {
        name: "ytt",
        description: "Youtube Together",
        category: "General",
        usage: `${PREFIX}ytt`,
        do: (message, client, args, Discord) => {
            const channel = message.member.voice.channel

            if (!channel) {
                let embed = new Discord.MessageEmbed()
                        .setDescription("Bạn phải ở trong voice mới thực hiện đƯợc lệnh này.")
                        .setColor("#ff0000")
                
                message.channel.send({embeds: [embed]})    
                return
            }
            else {
                fetch(`https://discord.com/api/v8/channels/${channel.id}/invites`, {
                method: "POST",
                body: JSON.stringify({
                    max_age: 86400,
                    max_uses: 0,
                    target_application_id: "755600276941176913",
                    target_type: 2,
                    temporary: false,
                    validate: null
                }),
                headers: {
                    "Authorization": `Bot ${client.token}`,
                    "Content-Type": "application/json"
                }
            }).then(res => res.json()).then(invite => {
                if (!invite.code) {
                    let embed = new Discord.MessageEmbed()
                    .setDescription("Không thể khởi tạo trình youtube.")
                    .setColor("#ff0000")
                    return message.channel.send(
                        {embeds: [embed]}
                    )
                }
                let embed = new Discord.MessageEmbed()
                .setDescription(`Tính năng hiện tại chỉ khả dụng cho discord app trên máy tính.\n[Click vào đây để khởi tạo Youtube Together](https://discord.com/invite/${invite.code})`)
                message.channel.send({embeds: [embed]})
            })
            }
        } 
    },
    cavatar : {
        name: "cavatar",
        description: "Coi custom avatar",
        category: "General",
        usage: `${PREFIX}cavatar <người dùng>`,
        do: async (message, client, args, Discord) => {
            let user = message.mentions.users.first() || client.users.cache.get(args[0]) || await client.users.fetch(args[0]).catch(err => undefined);
            if (!user) user = message.author
            let member = message.guild.members.cache.get(user.id);
            if(!member) await message.guild.members.fetch(user.id).catch(e=>{ }) || false;
            if(member){
                const data = await axios.get(`https://discord.com/api/guilds/${message.guild.id}/members/${user.id}`, {
                    headers: {
                        Authorization: `Bot ${client.token}`
                    }
                }).then(d => d.data);
                if(data.avatar && data.avatar != user.avatar){
                    let url = data.avatar.startsWith("a_") ? ".gif?size=4096" : ".png?size=4096";
                    url = `https://cdn.discordapp.com/guilds/${message.guild.id}/users/${user.id}/avatars/${data.avatar}${url}`;
                    message.channel.send(`**CUSTOM AVATAR of ${user.tag}**:\n> ${url}`)
                } else {
                    message.channel.send(":x: **User has no CUSTOM AVATAR**")
                }
            } else {
                message.channel.send(":x: **User has no CUSTOM AVATAR**")
            }
        } 
    },
    calc: {
        name: "calc",
        description: "Calculator",
        category: "General",
        usage: `${PREFIX}calc`,
        do: (message, client, args, Discord) => {
            simplydjs.calculator(message, {
                embedColor:"RANDOM",
                credit: false,
            })
        } 
    },
    rps: {
        name: "rps",
        description: "Búa kéo bao (Rock Paper Scissors)",
        category: "General",
        usage: `${PREFIX}calc`,
        do: (message, client, args, Discord) => {
            simplydjs.rps(message, {
                embedColor:"RANDOM",
                credit: false,
            })
        } 
    },
    banner: {
        name: "banner",
        description: "Banner",
        category: "General",
        usage: `${PREFIX}banner <người dùng>`,
        do: async (message, client, args, Discord) => {
            let user = message.mentions.users.first() || client.users.cache.get(args[0]) || await client.users.fetch(args[0]).catch(err => undefined);
            if (!user) user = message.author
        
            user = await user.fetch()
            if (user.banner) {
                message.channel.send({
                    embeds: [
                    new Discord.MessageEmbed()
                        .setImage(user.bannerURL({ size: 4096, dynamic: true }))
                        .setTitle(`Banner ${user.tag}`),
                    ],
                });
            } else {
                message.channel.send({
                    embeds: [
                    new Discord.MessageEmbed()
                        .setTitle(`${user.tag} got no banner.`),
                    ],
                });
            }
        } 
    },
}
    

client.on("messageCreate", message => {
    if(!message.content.toLowerCase().startsWith(PREFIX)) return;
    if (message.author.bot) return;
    // if (message.channel.type !== "dm") {
    //     filter.run(message, Discord, JUNKYARD_ID)
    //         .catch(e => console.error("Filter error: ", e));
    // }
    // otherFunctions(message);

    if (!message.content.toLowerCase().startsWith(PREFIX)) return;
    let args = message.content.split(" ").splice(1);
    let command = message.content.substring(PREFIX.length).split(" ");
    for (let i in commands){
        if (command[0].toLowerCase() === commands[i].name.toLowerCase()) {
            try {
                commands[i].do(message, client, args, Discord);
            } catch(e) {
                console.log(e);
            }
        }
    }
});

client.on('ready', () => {
    console.log(`${client.user.tag} has logged in`);
    client.user.setActivity(`: discord.gg/vietnamesecommunity`, { type: 'WATCHING' });

    // client.user.setPresence({
    //     activity:  {
    //         name: `Gõ ${PREFIX}help để xem các lệnh`
    //     },
    //     status: 'online',
    // });

    // let embed = new Discord.MessageEmbed();
    // embed.setColor("RANDOM");
    // embed.setThumbnail(client.user.avatarURL);
    // embed.setAuthor("Ready!", "https://media.discordapp.net/attachments/307975805357522944/392142646618882060/image.png");
    // embed.setDescription("Tớ đã online!");
    // embed.setTimestamp();
    // sendDM({ embed });
});

client.on('guildMemberAdd', async member => {
          if (member.user.bot) return;
          if (client.guilds.cache.some(id => id.id === '338907205619286026')) {
           let textChannel = member.guild.channels.cache.find(channel => channel.id === '719613863854604391');
           const canvas = require("discord-canvas"),  
           welcomeCanvas = await new canvas.Welcome();
           let image = await welcomeCanvas
              .setUsername(member.user.username)
              .setDiscriminator(member.user.discriminator)
              .setMemberCount(member.guild.memberCount)
              .setGuildName(member.guild.name)
              .setAvatar(member.user.displayAvatarURL({ format: "png", size: 4096}))
              .setColor("border", "#6600ff")
              .setColor("username-box", "#6200ff")
              .setColor("discriminator-box", "#6200ff")
              .setColor("message-box", "#6200ff")
              .setColor("title", "#008cff")
              .setColor("avatar", "#008cff")
              .setText("member-count", "- {count} members ")
              .setText("title", "welcome")
              .setText("message", "welcome to VNC")
              .setBackground("https://cdn.discordapp.com/attachments/719613863854604391/816318649950404608/123.jpg")
              .toAttachment();

            let attachment = new Discord.MessageAttachment(image.toBuffer(), "welcome-image.png");

            message.channel.send({
                content: 
                `
<a:VC_tada_p:705995469607927828>  Chào mừng ${message.author}, thành viên thứ ${message.guild.memberCount}.
<a:VC_muiten:704210750503125002> Hãy nói lời chào tại <#719613863854604391>.
<a:VC_starrycloud:755471583149031445> English chat in <#772780088881315850>.
<a:VC_Diamond:704210418096144464> Lấy roles tại <#698356548065427496>.
<a:VC_verify18:752528586350526504> Đừng quên đọc <#683261991351091217> để hiểu luật và thông tin server nhé!
<a:VC_colorheart:704210543635988531> Chúc các bạn có khoảng thời gian vui vẻ tại server!
                `,
                files: [attachment]
            })
         } else return;
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  if (message.channel.id === `719613863854604391`) {
    if (message.attachments.values().length > 0) {
    let attachment = message.attachments.values()[0];
    picExt.forEach(ext => {
      if(attachment.name.endsWith(ext)) {
          let embed = new Discord.MessageEmbed();
            embed.setColor("#ff6666");
            embed.setDescription(`⚠️ Để tránh loãng chat, ảnh của bạn sẽ bị xoá sau 20s`);
            message.channel.send({embeds: [embed]}).then(msg => {
              setTimeout(() => {
                msg.delete({embeds: [embed]});
              }, 10000);
            })
            setTimeout(() => {
              message.delete({files: [attachment]});  
            }, 20000)  
          }    
    });
    videoExt.forEach(ext => {
      if(attachment.name.endsWith(ext)) {
        let embed = new Discord.MessageEmbed();
          embed.setColor("#ff6666");
          embed.setDescription(`⚠️ Để tránh loãng chat, video của bạn sẽ bị xoá sau 20s`);
          message.channel.send({embeds: [embed]}).then(msg => {
            setTimeout(() => {
              msg.delete({embeds: [embed]});
            }, 10000);
          })
          setTimeout(() => {
            message.delete({files: [attachment]});  
          }, 20000)  
        }    
    });
    }
  }
  
})

// client.on('message', async (message) => {
//     let args = message.content.split(" ").splice(1);
//     if (message.channel.id == `819831888121561129`) {
//         if (message.author.bot) return;
//         let embed = new Discord.MessageEmbed();
//         embed.setDescription(`Chúc mừng ${message.author.tag} đã nộp đơn thành công, bot tự xoá thông tin trên đây để bảo mật riêng tư cho bạn, thông tin đã được tự động gửi riêng cho staff, bạn hãy chờ phản hồi!!!`);
//         embed.setFooter(`Cảm ơn ${message.author.tag} đã nộp đơn`, message.author.avatarURL())
//         embed.setColor("RANDOM");
//         embed.setTimestamp();
//         message.channel.send({embeds: [embed]}).then(message.delete(message.author));
//         const staffchannel = client.channels.cache.get(`819831990685663262`);
//         if (!staffchannel) return;
//         let embed1 = new Discord.MessageEmbed();
//         embed1.setAuthor(`${message.author.tag}`, message.author.avatarURL({ format: "png", size: 4096}));
//         embed1.setDescription(`${args.join(' ')}`);
//         embed1.setFooter(`Tin nhắn phản hồi tới ${message.author.tag}`, message.author.avatarURL());
//         embed1.setColor("RANDOM");
//         embed1.setTimestamp();
//         // embed1.setThumbnail(message.guild.iconURL({dynamic: true, size: 4096}));
//         staffchannel.send({embeds: [embed1]});
//      }
// })

// client.on('message', async (message) => {
//     if (message.author.bot) return;
//     if (message.channel.type !== 'dm') return;
//     else {
//         if (message.attachments.values().length > 0) {
//             let attachment = message.attachments.values()[0];
//         picExt.forEach(ext => {
//             if(attachment.name.endsWith(ext)) embed1.setImage(attachment.attachment);
//         });
//         videoExt.forEach(ext => {
//             if(attachment.name.endsWith(ext)) cfsChannel.send(attachment);
//         });
//         }
//         // embed1.setThumbnail(message.guild.iconURL({dynamic: true, size: 4096}));
//         cfsChannel.send({embeds: [embed1]});
//         fs.writeFileSync(`./count.json`, JSON.stringify({ count: count }));
//         logChannel.send(`Cfs số ${count}: ${message.content} | Người gửi ${message.author}`);


//     }

// })

client.on('messageReactionAdd', async (reaction, user) => {
    const handleStarboard = async () => {
        const starboard = client.channels.cache.find(channel => channel.id === '786082466216542240');
        const msgs = await starboard.messages.fetch({ limit: 100 });
        const existingMsg = msgs.find(msg => 
            msg.embeds.length === 1 ?
            (msg.embeds[0].footer.text.startsWith('⭐') && msg.embeds[0].footer.text.endsWith(reaction.message.id) ? true : false) : false);
        if(existingMsg) {
            const editembed = new Discord.MessageEmbed()
            .addField(`Nội dung tin nhắn`, reaction.message.content)
            .addField(`Người gửi`, reaction.message.author, true)
            .addField(`Channel`, reaction.message.channel, true)
            .setThumbnail(reaction.message.author.displayAvatarURL({dynamic: true, size: 4096}))
            .addField('Url', `[Ấn vào đây](${reaction.message.url})`)
            .setFooter(`⭐ - ${reaction.count} | ${reaction.message.id}`)
            .setColor("RANDOM")
            .setTimestamp();
            existingMsg.edit(editembed);
        }
        else if (reaction.count <= 2) {
            const embed = new Discord.MessageEmbed();
            embed.setColor("RANDOM");
            embed.setDescription('Cần ít nhất 3 sao để lên spotlight nhaaa');
            embed.setTimestamp();
            reaction.message.channel.send({embeds: [embed]}).then(msg => {
                setTimeout(() => {
                msg.delete({embeds: [embed]});
                }, 15000);
          });  
        }
        else {
            const embed = new Discord.MessageEmbed()
            .addField(`Nội dung tin nhắn`, reaction.message.content)
            .addField(`Người gửi`, reaction.message.author, true)
            .addField(`Channel`, reaction.message.channel, true)
            .setThumbnail(reaction.message.author.displayAvatarURL({dynamic: true, size: 4096}))
            .addField('Url', `[Ấn vào đây](${reaction.message.url})`)
            .setFooter(`⭐ - 3 | ${reaction.message.id}`)
            .setColor("RANDOM")
            .setTimestamp();
            if(starboard)
                starboard.send({embeds: [embed]});
        }
    }
    if(reaction.emoji.name === '⭐') {
        if(reaction.message.channel.name.toLowerCase() === 'spotlight') return;
        if(reaction.message.partial) {
            await reaction.fetch();
            await reaction.message.fetch();
            handleStarboard();
        }
        else
            handleStarboard();
    }
});


client.on('messageReactionRemove', async (reaction, user) => {
    const handleStarboard = async () => {
        const starboard = client.channels.cache.find(channel => channel.id === '786082466216542240');
        const msgs = await starboard.messages.fetch({ limit: 100 });
        const existingMsg = msgs.find(msg => 
            msg.embeds.length === 1 ?
            (msg.embeds[0].footer.text.startsWith('⭐') && msg.embeds[0].footer.text.endsWith(reaction.message.id) ? true : false) : false);
        if(existingMsg) {
            if(reaction.count === 0)
                existingMsg.delete({ timeout: 2500 });
            else {
                const editembed = new Discord.MessageEmbed()
                .addField(`Nội dung tin nhắn`, reaction.message.content)
                .addField(`Người gửi`, reaction.message.author, true)
                .addField(`Channel`, reaction.message.channel, true)
                .setThumbnail(reaction.message.author.displayAvatarURL({dynamic: true, size: 4096}))
                .addField('Url', `[Ấn vào đây](${reaction.message.url})`)
                .setFooter(`⭐ - ${reaction.count} | ${reaction.message.id}`)
                .setColor("RANDOM")
                .setTimestamp();
                existingMsg.edit(editembed);
            }
        }
        
    }
    if(reaction.emoji.name === '⭐') {
        if(reaction.message.channel.name.toLowerCase() === 'spotlight') return;
        if(reaction.message.partial) {
            await reaction.fetch();
            await reaction.message.fetch();
            handleStarboard();
        }
        else
            handleStarboard();
    }
});



client.on("messageCreate", async message => {
    if (message.author.bot) return;
    if (message.channel.id == '805958891686985749' || message.channel.id == '847129047849893898' || message.channel.id == '879574347134681168') {
      const query = querystring.stringify({text: message.content});   
      //https://api.simsimi.net/v1/c3c/?${query}&lang=vi_VN   
         const { success } = await fetch(`https://api.simsimi.net/v2/?${query}&lc=vi`).then(response => response.json());
//          const { messages } = await fetch(`https://api.simsimi.net/v1/?lang=vi_VN&cf=true&${query}`).then(response => response.json());
// 	 const query = querystring.stringify({ask: message.content})
// 	 const { msg } = await fetch(`https://meewmeew.info/simsimi/api?${query}&apikey=Meew_dMXT8QFxJ3EfUrRILBB1bvmIeT8Brj`).then(response => response.json());
// 	    message.reply(msg);
//           message.reply(messages[0].response);
        // const {text} = axios({
        //     url: `https://api.sfsu.xyz/?${query}&format=json&key=82da5c6c56eff4d7d60a21e5d63dc933`,
        //     method: "GET",
        //     mode: "no-cors"
        //   }).then(res => {
        //       var msg = /"text":"(.*?)"}/.exec(res.data)[1];
        //       if (msg)
        //         message.reply(msg);
        //     });   
        // const { success } = await fetch(`https://simsumi.herokuapp.com/api?${query}&lang=vi`).then(response => response.json());
        message.reply(success);
    }
});

client.on("messageCreate", async message => {
    if (message.author.bot) return;
    if (message.channel.id === '719613863854604391') {
      if (message.content.toLowerCase().startsWith('welcome')) {
          let args = message.content.split(" ").splice(1);
          let member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
          if (!member) {
            let embed = new Discord.MessageEmbed();
            embed.setTitle(`༺═───･Chào mừng bạn đến với VNC ･───═༻`);
            embed.setAuthor(`VC | SYSTEM`, message.guild.iconURL({dynamic: true, size: 4096}))
            embed.setDescription(`
<a:VC_tada_p:705995469607927828>  Chào mừng bạn đến với VNC.
<a:VC_muiten:704210750503125002> Hãy nói lời chào tại <#719613863854604391>.
<a:VC_starrycloud:755471583149031445> English chat in <#772780088881315850>.
<a:VC_Diamond:704210418096144464> Lấy roles tại <#698356548065427496>.
<a:VC_verify18:752528586350526504> Đừng quên đọc <#683261991351091217> để hiểu luật và thông tin server nhé!
<a:VC_colorheart:704210543635988531> Chúc các bạn có khoảng thời gian vui vẻ tại server!
            `)
            embed.setColor("RANDOM");
            embed.setTimestamp();
            embed.setFooter(`Welcome from ${message.author.tag}`, message.author.avatarURL({dynamic: true, size: 4096}))
            message.channel.send({embeds: [embed]})
        .then(msg => {
        setTimeout(() => {
        // const deleteEmbed = new Discord.MessageEmbed();
        msg.delete();
        }, 10000);
    });            
          } else {
            let embed = new Discord.MessageEmbed();
            embed.setTitle(`༺═───･Chào mừng bạn đến với VNC ･───═༻`);
            embed.setAuthor(`VC | SYSTEM`, message.guild.iconURL({dynamic: true, size: 4096}))
            embed.setDescription(`
<a:VC_tada_p:705995469607927828>  Chào mừng <@!${member.user.id}>, thành viên thứ ${member.guild.memberCount}.
<a:VC_muiten:704210750503125002> Hãy nói lời chào tại <#719613863854604391>.
<a:VC_starrycloud:755471583149031445> English chat in <#772780088881315850>.
<a:VC_Diamond:704210418096144464> Lấy roles tại <#698356548065427496>.
<a:VC_verify18:752528586350526504> Đừng quên đọc <#683261991351091217> để hiểu luật và thông tin server nhé!
<a:VC_colorheart:704210543635988531> Chúc các bạn có khoảng thời gian vui vẻ tại server!
            `)
            embed.setColor("RANDOM");
            embed.setTimestamp();
            embed.setFooter(`Welcome ${member.user.tag}`, member.user.avatarURL({dynamic: true, size: 4096}))
            embed.setThumbnail(member.user.avatarURL({dynamic: true, size: 4096}));
            message.channel.send({embeds: [embed]})
        .then(msg => {
        setTimeout(() => {
        // const deleteEmbed = new Discord.MessageEmbed();
        msg.delete();
        }, 10000);
    });
          }
      } 
    }
});


// client.on( "guildMemberAdd", member => {
//     let textChannel = member.guild.channels.cache.find(channel => channel.id === '719613863854604391');
    
//     if (textChannel){
//             var messages = [
//                 `Brace yourselves. <@${member.user.id}> just joined the server.`,
//                 `Challenger approaching - <@${member.user.id}> has appeared`,
//                 `Welcome <@${member.user.id}>. Leave your weapon by the door.`,
//                 `Big <@${member.user.id}> showed up!`,
//                 `<@${member.user.id}> just joined... or did they?`,
//                 `Ready player <@${member.user.id}>`,
//                 `<@${member.user.id}> hopped into the server. Kangaroo!!`,
//                 `<@${member.user.id}> joined. You must construct additional pylons.`,
//                 `Hello. Is it <@${member.user.id}> you're looking for?`,
//                 `Where's <@${member.user.id}> in the server!`,
//                 `It's dangerous to go alone, take <@${member.user.id}>`
//             ]
    
//             textChannel.send({embed: {
//                 color: 3447003,
//                 description: messages[ Math.floor( Math.random() * 11 ) ],
//                 timestamp: new Date(),
//             }
//             }); 
//         }
//     });
 

client.login(process.env.TOKEN);
