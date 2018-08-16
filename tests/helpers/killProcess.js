/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
module.exports = async (processPid) => {
  if (processPid.killed)
    return true;
  processPid.kill();
  await Promise.delay(5000);
}
