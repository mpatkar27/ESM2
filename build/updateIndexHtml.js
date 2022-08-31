/*
 * Remove leading slash from UI5 bootstrap.
 *
 * Author(s): Szalai Andras <andras.szalai@gramont.ch>
 * Company: Gramont Kft.
 */

module.exports = async function({workspace}) {
    const aResources = await workspace.byGlob("**/*.html");
    
    for (var i = 0; i < aResources.length; i++) {
        const oResource = aResources[i];
        const sContent = await oResource.getString();
        const sNewContent = sContent.replace(/"\/resources\//g, "\"resources/");
        oResource.setString(sNewContent);

        await workspace.write(oResource);
    }
};
