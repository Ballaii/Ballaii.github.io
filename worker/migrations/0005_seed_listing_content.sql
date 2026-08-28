UPDATE product_revisions SET content_json = json_object(
  'title', 'Ballai Save System', 'category', 'assets', 'kind', 'Unity Asset',
  'shortDescription', 'A modular save framework for slots, metadata, serialization, storage, and registered saveable objects.',
  'longDescription', 'Ballai Save System brings the persistence pieces of a Unity project into one reusable framework.',
  'tags', json_array('Unity', 'Save Slots', 'Serialization', 'Tools'),
  'features', json_array('Reusable save slots with metadata.', 'Serialization separated from registered saveable objects.', 'Autosave and backup recovery workflows.'),
  'technicalInfo', json_array(json_object('label','Engine','value','Unity'), json_object('label','Package type','value','Editor and runtime framework')),
  'detailSections', json_array(), 'youtubeVideoId', 'z_TTNZZ34-A'
) WHERE product_id = 'ballai-save-system';
UPDATE product_revisions SET content_json = json_object(
  'title', 'Ballai Scene Transition and Checkpoint System', 'category', 'assets', 'kind', 'Unity Asset',
  'shortDescription', 'Reusable scene transitions, entry points, checkpoints, respawning, and screen fading.',
  'longDescription', 'A focused Unity framework for moving players between scenes and returning them to the correct place.',
  'tags', json_array('Unity', 'Scene Loading', 'Checkpoints', 'Respawn'),
  'features', json_array('Reusable transitions and named destinations.', 'Multiple entry points for context-aware spawn positions.', 'Checkpoints, hazards, and respawn flow.'),
  'technicalInfo', json_array(json_object('label','Engine','value','Unity'), json_object('label','Package type','value','Runtime scene-management framework')),
  'detailSections', json_array(), 'youtubeVideoId', 'zxSRW-qDjqM'
) WHERE product_id = 'ballai-scene-transition';
UPDATE product_revisions SET content_json = json_object(
  'title', 'Ballai Basic Interaction System', 'category', 'assets', 'kind', 'Unity Asset',
  'shortDescription', 'Reusable interaction tools for NPCs, inspectable objects, signs, doors, levers, and world triggers.',
  'longDescription', 'A reusable interaction foundation for Unity scenes that need clear prompts and consistent world actions.',
  'tags', json_array('Unity', 'Interaction', 'Dialogue', '2D'),
  'features', json_array('Contextual prompts for nearby world actions.', 'Reusable triggers for NPCs and objects.', 'Editor-configured components for reuse.'),
  'technicalInfo', json_array(json_object('label','Engine','value','Unity'), json_object('label','Package type','value','Editor and runtime interaction framework')),
  'detailSections', json_array(), 'youtubeVideoId', 'QPpf_homziY'
) WHERE product_id = 'ballai-interaction-system';
UPDATE product_revisions SET content_json = json_object(
  'title', 'Ballai Input and Tutorial Framework', 'category', 'assets', 'kind', 'Unity Asset',
  'shortDescription', 'A Unity Input System framework for rebinding, device-aware control icons, and reusable tutorial popups.',
  'longDescription', 'A reusable layer around Unity Input System for projects that need rebinding, control glyphs, action references, and tutorial prompts.',
  'tags', json_array('Unity', 'Input System', 'Rebinding', 'Tutorials'),
  'features', json_array('Runtime rebinding through Unity Input System.', 'Device-aware control icons.', 'Reusable tutorial and onboarding popups.'),
  'technicalInfo', json_array(json_object('label','Engine','value','Unity'), json_object('label','Dependency','value','Unity Input System')),
  'detailSections', json_array(), 'youtubeVideoId', 'tGD3JQSfkhM'
) WHERE product_id = 'ballai-input-tutorial';
UPDATE product_revisions SET content_json = json_object(
  'title', 'Pixel Art Scythe UI Frame', 'category', 'assets', 'kind', 'Pixel Art Asset',
  'shortDescription', 'A dark fantasy pixel-art scythe created for 2D games, metroidvanias, RPGs, and roguelikes.',
  'longDescription', 'The scythe includes an animated eye with an idle movement and transparent artwork for game UI.',
  'tags', json_array('Pixel Art', 'Aseprite', 'PNG', 'Engine Independent'),
  'features', json_array('Dark fantasy pixel-art weapon.', 'Animated eye with idle movement.', 'Transparent background.', 'Engine independent.'),
  'technicalInfo', json_array(json_object('label','Source file','value','pixelscythe.aseprite'), json_object('label','Compatibility','value','Any engine supporting standard image formats')),
  'detailSections', json_array(), 'youtubeVideoId', NULL
) WHERE product_id = 'pixel-art-scythe-ui';
UPDATE product_revisions SET content_json = json_object(
  'title', 'Dark Pixel Keyboard Glyph Pack', 'category', 'assets', 'kind', 'Pixel Art Asset',
  'shortDescription', 'Clean pixel keyboard glyphs designed for dark game UIs and input prompts.',
  'longDescription', 'A focused collection of pixel-style keyboard glyphs made for dark interfaces, tutorials, rebinding menus, interaction prompts, and compact HUDs.',
  'tags', json_array('Pixel Art', 'Keyboard', 'Input Prompts', 'No Generative AI'),
  'features', json_array('Numbers, letters, arrows, function keys, modifiers, navigation, and symbols.', 'Readable at small sizes in dark HUDs and menus.', 'Engine independent artwork.'),
  'technicalInfo', json_array(json_object('label','Package','value','keyboard_glyphs.png'), json_object('label','Compatibility','value','Any engine supporting standard image formats')),
  'detailSections', json_array(), 'youtubeVideoId', NULL
) WHERE product_id = 'dark-pixel-keyboard-glyph-pack';
